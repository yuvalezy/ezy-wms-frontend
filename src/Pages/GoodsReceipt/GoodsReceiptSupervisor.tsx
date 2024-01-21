import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../../Components/AppContext";
import ContentTheme from "../../Components/ContentTheme";
import DocumentForm from "./Components/DocumentForm";
import {documentAction, fetchDocuments,} from "./Data/Document";
import DocumentCard from "./Components/DocumentCard";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {MessageBox, MessageBoxActions, MessageStripDesign} from "@ui5/webcomponents-react";
import {Document, DocumentAction} from "../../Assets/Document";
import {StringFormat} from "../../Assets/Functions";
import QRDialog, {QRDialogRef} from "../../Components/QRDialog";
import {globalSettings} from "../../Assets/GlobalConfig";
import {Authorization} from "../../Assets/Authorization";

export default function GoodsReceiptSupervisor() {
    const qrRef = useRef<QRDialogRef>(null);
    const {user} = useAuth();
    const [supervisor, setSupervisor] = useState(false);
    const {t} = useTranslation();
    const {setLoading, setAlert} = useThemeContext();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<DocumentAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const errorAlert = (message: string) => setAlert({message: message, type: MessageStripDesign.Negative});

    useEffect(() => {
        setSupervisor(user?.authorizations.filter((v) => v === Authorization.GOODS_RECEIPT_SUPERVISOR).length === 1);
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
            qrRef?.current?.show(true);
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

    function handleCloseQR() {
        qrRef?.current?.show(false);
    }

    function getTitle(): string {
        let title = t("goodsReceiptSupervisor");
        if (!globalSettings?.grpoCreateSupervisorRequired ?? false) {
            if (!supervisor) {
                title = t("goodsReceiptCreation");
            }
        }
        return title;
    }

    return (
        <ContentTheme title={getTitle()} icon="kpi-managing-my-area">
            <DocumentForm
                onError={errorAlert}
                onNewDocument={(newDocument) =>
                    setDocuments((prevDocs) => [newDocument, ...prevDocs])
                }
            />
            <br/>
            <br/>
            {documents.map((doc) => (
                <DocumentCard supervisor={supervisor} key={doc.id} doc={doc} handleAction={handleAction}/>
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
                <br/> {t('actionCannotReverse')}
            </MessageBox>
            <QRDialog ref={qrRef} onClose={handleCloseQR} prefix="GRPO" id={selectedDocumentId}/>
        </ContentTheme>
    );
}
