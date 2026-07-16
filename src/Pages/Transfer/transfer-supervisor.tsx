import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useAuth, useThemeContext} from "@/components";
import TransferStatusFilter, {
    DEFAULT_TRANSFER_STATUSES,
    TRANSFER_FILTER_STATUSES,
    TransferStatusFilterRef
} from "@/features/transfer/components/transfer-status-filter";
import {Status} from "@/features/shared/data";
import {useTransferSupervisorData} from "@/features/transfer/hooks/useTransferSupervisorData";
import TransferCard from "@/features/transfer/components/transfer-card";
import TransferTable from "@/features/transfer/components/transfer-table";
import {StringFormat} from "@/utils/string-utils";
import TransferForm from "@/features/transfer/components/transfer-form";
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";
import {User} from "@/features/users/data/user";
import {Loader2} from "lucide-react";
import {ObjectAction} from "@/features/shared/data";
import {TransferTableSkeleton} from "@/features/transfer/components/transfer-table-skeleton";
import {TransferCardSkeleton} from "@/features/transfer/components/transfer-card-skeleton";

export default function TransferSupervisor() {
    const {t} = useTranslation();
    const {user} = useAuth();
    const {setError} = useThemeContext();
    const {supervisor, getTitle} = useTransferSupervisorData();
    const [transfers, setTransfers] = useState<TransferDocument[]>([]);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferDocument | null>(null);
    const [actionType, setActionType] = useState<ObjectAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statuses, setStatuses] = useState<Status[]>(DEFAULT_TRANSFER_STATUSES);
    const filterRef = useRef<TransferStatusFilterRef>(null);

    const loadTransfers = useCallback(() => {
        setIsLoading(true);
        // An empty selection means "don't constrain by status". Send the full list rather than no status at
        // all: the backend reads a missing status filter as every status, which would drag in the transient
        // Processing documents this screen has never shown.
        const search = statuses.length > 0 ? statuses : TRANSFER_FILTER_STATUSES;
        return transferService.search({statuses: search, progress: true})
            .then((data) => setTransfers(data))
            .catch((error) => setError(error))
            .finally(() => setIsLoading(false));
    }, [statuses, setError]);

    useEffect(() => {
        loadTransfers();
    }, [loadTransfers]);

    const handleConfirmAction = () => {
        setDialogOpen(false);

        if (actionType === "process") {
            setIsProcessing(true);
        }

        const id = selectedTransfer?.id!;

        const serviceCall = actionType === "cancel"
        ? transferService.cancel(id) :
          transferService.process(id);

        serviceCall
            .then((result) => {
                if (typeof result === "boolean" || result.success) {
                    toast.success(actionType === "process" ? t("transferApproved") : t("transferCancelled"));
                    // Re-read rather than dropping the row locally: the transfer still exists, and whether it
                    // belongs in the list now depends on whether the filter includes its new status.
                    loadTransfers();
                }
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => {
                if (actionType === "process") {
                    setIsProcessing(false);
                }
            });
    };

    function handleAction(transfer: TransferDocument, action: ObjectAction) {
        setSelectedTransfer(transfer);
        setActionType(action);
        setDialogOpen(true);
    }

    return (
        <ContentTheme title={getTitle()} onFilterClicked={() => filterRef.current?.togglePanel()}>
            <TransferStatusFilter ref={filterRef} value={statuses} onChange={setStatuses}/>
            <TransferForm onNewTransfer={transfer => {
                const createByUser: User = {
                    fullName: user!.name, id: user!.id, deleted: false,
                    superUser: false,
                    active: false,
                    warehouses: []
                };
                const newTransfer = {...transfer, createdByUser: createByUser};
                setTransfers((prevTransfers) => [newTransfer, ...prevTransfers]);
            }}/>
            <div className="my-4">
                {isLoading ? (
                    <>
                        {/* Mobile view - Card skeletons */}
                        <div className="block sm:hidden" aria-label="Loading...">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <TransferCardSkeleton key={index} />
                            ))}
                        </div>

                        {/* Desktop view - Table skeleton */}
                        <div className="hidden sm:block" aria-label="Loading...">
                            <TransferTableSkeleton />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Mobile view - Cards */}
                        <div className="block sm:hidden">
                            {transfers.map((transfer) => (
                                <TransferCard supervisor={true} key={transfer.id} doc={transfer} onAction={handleAction}/>
                            ))}
                        </div>
                        
                        {/* Desktop view - Table */}
                        <div className="hidden sm:block">
                            <TransferTable 
                                transfers={transfers} 
                                supervisor={true} 
                                onAction={handleAction} 
                            />
                        </div>
                    </>
                )}
            </div>
            
            {isProcessing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t('processing')}</p>
                    </div>
                </div>
            )}
            
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmAction")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {StringFormat(
                                actionType === "process"
                                    ? t("confirmFinishTransfer")
                                    : t("confirmCancelTransfer"),
                                selectedTransfer?.number
                            )}
                            <br/> {t('actionCannotReverse')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleConfirmAction}>
                            {t("accept")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ContentTheme>
    );
}
