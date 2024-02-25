import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, MessageBox, MessageBoxActions, MessageStripDesign} from "@ui5/webcomponents-react";
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {createTransfer, fetchTransfers, Transfer, transferAction} from "./Data/Transfer";
import TransferCard from "./Components/TransferCard";
import QRDialog, {QRDialogRef} from "../../Components/QRDialog";
import {ObjectAction} from "../../Assets/Common";
import {StringFormat} from "../../Assets/Functions";

export default function TransferSupervisor() {
    const qrRef = useRef<QRDialogRef>(null);
    const {t} = useTranslation();
    const {setLoading, setAlert, setError} = useThemeContext();
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<ObjectAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchTransfers({progress: true})
            .then((data) => {
                setTransfers(data);
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => setLoading(false));
    }, []);
    function create() {
        setLoading(true);
        try {
            createTransfer()
                .then((response) => {
                    setAlert({message: t("transferCreated"), type: MessageStripDesign.Positive});
                })
                .catch((e) => {
                    setError(e);
                })
                .finally(() => setLoading(false));
        } catch (e: any) {
            setError(e);
        }
    }
    const handleConfirmAction = () => {
        setLoading(true);
        setDialogOpen(false);
        transferAction(selectedTransferId!, actionType!)
            .then(() => {
                setTransfers((prevTransfers) =>
                    prevTransfers.filter((transfer) => transfer.id !== selectedTransferId)
                );
                setAlert({message: actionType === "approve" ? t("transferApproved") : t("transferCancelled"), type: MessageStripDesign.Positive});
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
            qrRef?.current?.show(true);
        }
    }

    return <ContentTheme title={t("transferSupervisor")} icon="journey-depart">
        <Form>
            <FormItem>
                <Button color="primary" icon="create" onClick={() => create()}>
                    {t("create")}
                </Button>
            </FormItem>
        </Form>
        <br/>
        <br/>
        {transfers.map((transfer) => (
            <TransferCard key={transfer.id} doc={transfer} onAction={handleAction}/>
        ))}
        <MessageBox
            onClose={(e) => {
                if (e.detail.action === MessageBoxActions.OK) {
                    handleConfirmAction();
                    return;
                }
                setDialogOpen(false);
            }}
            open={dialogOpen}
            type="Confirm"

        >
            {StringFormat(
                actionType === "approve"
                    ? t("confirmFinishTransfer")
                    : t("confirmCancelTransfer"),
                selectedTransferId
            )}
            <br/> {t('actionCannotReverse')}
        </MessageBox>
        <QRDialog ref={qrRef} prefix="TRSF" id={selectedTransferId}/>
    </ContentTheme>
}
