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
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardHeader, CardFooter} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Progress} from "@/components/ui/progress";
import {Loader2} from "lucide-react";

export default function TransferSupervisor() {
    const {t} = useTranslation();
    const {user} = useAuth();
    const {setError} = useThemeContext();
    const [transfers, setTransfers] = useState<TransferDocument[]>([]);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferDocument | null>(null);
    const [actionType, setActionType] = useState<ObjectAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        transferService.search({progress: true})
            .then((data) => setTransfers(data))
            .catch((error) => setError(error))
            .finally(() => setIsLoading(false));
    }, [setError]);
    const handleConfirmAction = () => {
        setDialogOpen(false);
        
        if (actionType === "approve") {
            setIsProcessing(true);
        }
        
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
            .finally(() => {
                if (actionType === "approve") {
                    setIsProcessing(false);
                }
            });
    };

    function handleAction(transfer: TransferDocument, action: 'approve' | 'cancel') {
        setSelectedTransfer(transfer);
        setActionType(action);
        setDialogOpen(true);
    }

    // Skeleton components
    const TableSkeleton = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead><Skeleton className="h-4 w-12" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell>
                            <div className="flex items-center space-x-2">
                                <Progress value={0} className="w-20" />
                                <Skeleton className="h-3 w-8" />
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right">
                            <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const CardSkeleton = () => (
        <Card className="mb-4 shadow-lg">
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="py-4">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-18" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-14" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="pt-2">
                        <Progress value={0} className="w-full" />
                        <Skeleton className="h-3 w-20 mx-auto mt-1" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-20" />
            </CardFooter>
        </Card>
    );

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
                {isLoading ? (
                    <>
                        {/* Mobile view - Card skeletons */}
                        <div className="block sm:hidden" aria-label="Loading...">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <CardSkeleton key={index} />
                            ))}
                        </div>
                        
                        {/* Desktop view - Table skeleton */}
                        <div className="hidden sm:block" aria-label="Loading...">
                            <TableSkeleton />
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
