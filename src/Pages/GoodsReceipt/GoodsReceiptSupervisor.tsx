import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../../components/AppContext";
import DocumentForm from "./components/DocumentForm";
import {documentAction, fetchDocuments,} from "./Data/Document";
import DocumentCard from "./components/DocumentCard";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
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
import { MessageStripDesign} from "@ui5/webcomponents-react"; // Keep for MessageStripDesign enum
import {Document} from "@/Assets/Document";
import {StringFormat} from "@/Assets/Functions";
import {globalSettings} from "@/Assets/GlobalConfig";
import {Authorization} from "@/Assets/Authorization";
import DocumentListDialog, {DocumentListDialogRef} from "./components/DocumentListDialog";
import {ObjectAction, Status} from "@/Assets/Common";
import ContentTheme from "@/components/ContentTheme";

export default function GoodsReceiptSupervisor() {
    const {user} = useAuth();
    const [supervisor, setSupervisor] = useState(false);
    const {t} = useTranslation();
    const {setLoading, setAlert, setError} = useThemeContext();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [actionType, setActionType] = useState<ObjectAction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const documentListDialogRef = useRef<DocumentListDialogRef>(null);

    useEffect(() => {
        setSupervisor(user?.authorizations.filter((v) => v === Authorization.GOODS_RECEIPT_SUPERVISOR).length === 1);
        setLoading(true);
        fetchDocuments({status: [Status.Open, Status.InProgress]})
            .then((data) => setDocuments(data))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, []);

    function handleDocDetails(doc: Document) {
        setSelectedDocument(doc);
        documentListDialogRef?.current?.show();
    }

    const handleAction = (docId: number, action: ObjectAction) => {
        setSelectedDocumentId(docId);
        setActionType(action);
        if (action !== "qrcode") {
            setDialogOpen(true);
        } else {
          console.error('qr discontinued');
            // qrRef?.current?.show(true);
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
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    };

    function getTitle(): string {
        let title = t("goodsReceiptSupervisor");
      if (!globalSettings?.grpoCreateSupervisorRequired) {
            if (!supervisor) {
                title = t("goodsReceiptCreation");
            }
        }
        return title;
    }

    return (
        <ContentTheme title={getTitle()}>
            <DocumentForm
                onNewDocument={(newDocument) =>
                    setDocuments((prevDocs) => [newDocument, ...prevDocs])
                }
            />
            <br/>
            <br/>
            {documents.map((doc) => (
                <DocumentCard supervisor={supervisor} key={doc.id} doc={doc} action={handleAction} docDetails={handleDocDetails}/>
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
            {/*<QRDialog ref={qrRef} prefix="GRPO" id={selectedDocumentId}/>*/}
            <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
        </ContentTheme>
    );
}
