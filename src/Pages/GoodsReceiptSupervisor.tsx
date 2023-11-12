import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../Components/AppContext";
import ContentTheme from "../Components/ContentTheme";
import {StringFormat} from "../Assets/Functions";
import DocumentForm from "./GoodsReceiptSupervisor/DocumentForm";
import { documentAction, fetchDocuments,} from "./GoodsReceiptSupervisor/Document";
import DocumentCard from "./GoodsReceiptSupervisor/DocumentCard";
import {useThemeContext} from "../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Bar, Button, Dialog, DialogDomRef, MessageBox, MessageBoxActions, MessageStripDesign} from "@ui5/webcomponents-react";
import QRCode from "qrcode.react";
import {Document, DocumentAction} from "../Assets/Document";

export default function GoodsReceiptSupervisor() {
    const dialogRef = useRef<DialogDomRef>(null);
    const {user} = useAuth();
    const {t} = useTranslation();
    const {setLoading, setAlert} = useThemeContext();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(
        null
    );
    const [actionType, setActionType] = useState<DocumentAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const errorAlert = (message: string) => setAlert({message: message, type: MessageStripDesign.Negative});

    useEffect(() => {
        setLoading(true);
        fetchDocuments()
            .then((data) => {
                setDocuments(data);
            })
            .catch((error) => {
                console.error(`Error fetching documents: ${error}`);
                errorAlert(`Error fetching documents: ${error}`);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAction = (docId: number, action: DocumentAction) => {
        setSelectedDocumentId(docId);
        setActionType(action);
        if (action !== "qrcode") {
            setDialogOpen(true);
        } else {
            dialogRef?.current?.show();
            // setQrOpen(true);
        }
    };

    const handleConfirmAction = () => {
        setLoading(true);
        setDialogOpen(false);
        documentAction(selectedDocumentId!, actionType!, user!)
            .then(() => {
                setDocuments((prevDocs) =>
                    prevDocs.filter((doc) => doc.id !== selectedDocumentId)
                );
                setAlert({message: actionType === "approve" ? t("approved") : t("cancelled"), type: MessageStripDesign.Positive});
            })
            .catch((error) => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"];
                if (errorMessage) errorAlert(`SAP Error: ${errorMessage}`);
                else errorAlert(`Error performing action: ${error}`);
            })
            .finally(() => setLoading(false));
    };

    return (
        <ContentTheme title={t("goodsReceiptSupervisor")} icon="kpi-managing-my-area">
            <DocumentForm
                onError={errorAlert}
                onNewDocument={(newDocument) =>
                    setDocuments((prevDocs) => [newDocument, ...prevDocs])
                }
            />
            <br/>
            <br/>
            {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} handleAction={handleAction}/>
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
                        ? t("confirmFinishDocument")
                        : t("confirmCancelDocument"),
                    selectedDocumentId
                )}
                <br /> {t('actionCannotReverse')}
            </MessageBox>
            <Dialog
                className="footerPartNoPadding"
                ref={dialogRef}
                footer={
                    <Bar
                        design="Footer"
                        endContent={
                            <Button onClick={() => dialogRef?.current?.close()}>
                                {t("close")}
                            </Button>
                        }
                    />
                }
            >
                <QRCode
                    value={`$GRPO_${selectedDocumentId}`}
                    width={200}
                    height={200}
                    color="black"
                    bgColor="white"
                />
            </Dialog>
        </ContentTheme>
    );
}
