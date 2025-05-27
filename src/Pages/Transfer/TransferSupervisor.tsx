import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import { MessageStripDesign} from "@ui5/webcomponents-react"; // Keep for MessageStripDesign enum
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "@/components/ThemeContext";
import {fetchTransfers, TransferDocument, transferAction} from "./Data/TransferDocument";
import TransferCard from "./Components/TransferCard";
import {ObjectAction} from "@/Assets/Common";
import {StringFormat} from "@/Assets/Functions";
import TransferForm from "./Components/TransferForm";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function TransferSupervisor() {
    const {t} = useTranslation();
    const {setLoading, setAlert, setError} = useThemeContext();
    const [transfers, setTransfers] = useState<TransferDocument[]>([]);
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);
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
        transferAction(selectedTransferId!, actionType!)
            .then(() => {
                setTransfers((prevTransfers) =>
                    prevTransfers.filter((transfer) => transfer.id !== selectedTransferId)
                );
                setAlert({
                    message: actionType === "approve" ? t("transferApproved") : t("transferCancelled"),
                    type: MessageStripDesign.Positive
                });
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => setLoading(false));
    };

    function handleAction(id: number, action: 'approve' | 'cancel' | 'qrcode') {
        setSelectedTransferId(id);
        setActionType(action);
        if (action !== "qrcode") {
            setDialogOpen(true);
        } else {
            console.error('qr discontinue');
            // qrRef?.current?.show(true);
        }
    }

    return (
        <ContentTheme title={t("transferSupervisor")}>
            <TransferForm onNewTransfer={transfer => setTransfers((prevTransfers) => [transfer, ...prevTransfers])}/>
            <div className="my-4">
                {transfers.map((transfer, index) => (
                    <TransferCard supervisor={true} key={transfer.id} doc={transfer} onAction={handleAction}/>
                ))}
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
                                selectedTransferId
                            )}
                            <br/> {t('actionCannotReverse')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleConfirmAction}>
                            {t("ok")}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ContentTheme>
    );
}
