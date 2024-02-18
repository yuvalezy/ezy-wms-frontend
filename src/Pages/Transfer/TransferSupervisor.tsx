import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, MessageStripDesign} from "@ui5/webcomponents-react";
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {createTransfer, fetchTransfers, Transfer} from "./Data/Transfer";
import DocumentCard from "../GoodsReceipt/Components/DocumentCard";
import TransferCard from "./Components/TransferCard";
import QRDialog, {QRDialogRef} from "../../Components/QRDialog";

import {ObjectAction} from "../../Assets/Common";

export default function TransferSupervisor() {
    const qrRef = useRef<QRDialogRef>(null);
    const {t} = useTranslation();
    const {setLoading, setAlert} = useThemeContext();
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<ObjectAction | null>(null);

    const errorAlert = (message: string) => setAlert({message: message, type: MessageStripDesign.Negative});

    useEffect(() => {
        setLoading(true);
        fetchTransfers()
            .then((data) => {
                setTransfers(data);
            })
            .catch((error) => {
                console.error(`Error fetching transfers: ${error}`);
                errorAlert(`Error fetching transfers: ${error}`);
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
                    console.error(`Error creating document: ${e}`);
                    errorAlert(`Error creating document: ${e.message}`);
                })
                .finally(() => setLoading(false));
        } catch (e: any) {
            errorAlert(`Error creating document: ${e.message}`);
        }
    }

    function handleAction(id: number, action: 'approve' | 'cancel' | 'qrcode') {
        setSelectedTransferId(id);
        setActionType(action);
        if (action !== "qrcode") {
            // setDialogOpen(true);
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
        <QRDialog ref={qrRef} prefix="TRSF" id={selectedTransferId}/>
    </ContentTheme>
}
