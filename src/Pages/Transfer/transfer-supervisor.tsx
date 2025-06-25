import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {useThemeContext} from "@/components";
import {fetchTransfers, TransferDocument, transferAction} from "@/pages/transfer/data/transfer-document";
import TransferCard from "@/pages/transfer/components/transfer-card";
import TransferTable from "@/pages/transfer/components/transfer-table";
import {ObjectAction} from "@/assets/Common";
import {StringFormat} from "@/assets/Functions";
import TransferForm from "@/pages/transfer/components/transfer-form";
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

export default function TransferSupervisor() {
    const {t} = useTranslation();
    const {setLoading, setError} = useThemeContext();
    const [transfers, setTransfers] = useState<TransferDocument[]>([]);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferDocument | null>(null);
    const [actionType, setActionType] = useState<ObjectAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchTransfers({progress: true})
            .then((data) => setTransfers(data))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, []);
    const handleConfirmAction = () => {
        setLoading(true);
        setDialogOpen(false);
        const id = selectedTransfer?.id!;
        transferAction(id, actionType!)
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
            <TransferForm onNewTransfer={transfer => setTransfers((prevTransfers) => [transfer, ...prevTransfers])}/>
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
