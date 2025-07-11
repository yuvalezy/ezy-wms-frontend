import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {useAuth, useThemeContext} from "@/components";
import TransferCard from "@/features/transfer/components/transfer-card";
import TransferTable from "@/features/transfer/components/transfer-table";
import {ObjectAction} from "@/features/shared/data/shared";
import {StringFormat} from "@/utils/string-utils";
import TransferForm from "@/features/transfer/components/transfer-form";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";
import {User} from "@/features/users/data/user";

export default function TransferSupervisor() {
    const {t} = useTranslation();
    const {user} = useAuth();
    const {setLoading, setError} = useThemeContext();
    const [transfers, setTransfers] = useState<TransferDocument[]>([]);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferDocument | null>(null);
    const [actionType, setActionType] = useState<ObjectAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        transferService.search({progress: true})
            .then((data) => setTransfers(data))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, []);
    const handleConfirmAction = () => {
        setLoading(true);
        setDialogOpen(false);
        const id = selectedTransfer?.id!;

        const serviceCall = actionType === "cancel"
        ? transferService.cancel(id) :
          transferService.process(id);

        serviceCall
            .then((result) => {
                if (typeof result === "boolean" || result.success) {
                    setTransfers((prevTransfers) =>
                        prevTransfers.filter((transfer) => transfer.id !== id)
                    );
                    toast.success(actionType === "approve" ? t("transferApproved") : t("transferCancelled"));
                }
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => setLoading(false));
    };

    function handleAction(transfer: TransferDocument, action: 'approve' | 'cancel') {
        setSelectedTransfer(transfer);
        setActionType(action);
        setDialogOpen(true);
    }

    return (
        <ContentTheme title={t("transferSupervisor")}>
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
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmAction")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {StringFormat(
                                actionType === "approve"
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
