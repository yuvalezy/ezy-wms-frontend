import React, {useEffect, useRef, useState} from "react";
import ConfirmationDialog from "../Components/ConfirmationDialog";
import {useAuth} from "../Components/AppContext";
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import ContentTheme from "../Components/ContentTheme";
import {StringFormat} from "../assets/Functions";
import DocumentForm from "./GoodsReceiptSupervisor/DocumentForm";
import {Document, fetchDocuments, Action, documentAction} from "./GoodsReceiptSupervisor/Document";
import DocumentCard from "./GoodsReceiptSupervisor/DocumentCard";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import {useLoading} from "../Components/LoadingContext";
import {useTranslation} from "react-i18next";
import {Dialog, DialogDomRef, Bar, Button} from "@ui5/webcomponents-react";
import QRCode from "qrcode.react";

export default function GoodsReceiptSupervisor() {
    const dialogRef = useRef<DialogDomRef>(null);
    const {user} = useAuth();
    const {t} = useTranslation();
    const {setLoading} = useLoading();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<Action | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = React.useState<SnackbarState>({open: false});

    const errorAlert = (message: string) => {
        setSnackbar({open: true, message: message, color: 'red'});
        setTimeout(() => setSnackbar({open: false}), 5000);
    };

    useEffect(() => {
        setLoading(true);
        fetchDocuments()
            .then(data => {
                setDocuments(data);
            })
            .catch(error => {
                console.error(`Error fetching documents: ${error}`);
                errorAlert(`Error fetching documents: ${error}`);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAction = (docId: number, action: Action) => {
        setSelectedDocumentId(docId);
        setActionType(action);
        if (action !== 'qrcode') {
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
                setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocumentId));
                alert(actionType === 'approve' ? t('Approved') : t('Cancelled'));
            })
            .catch(error => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data['exceptionMessage'];
                if (errorMessage)
                    errorAlert(`SAP Error: ${errorMessage}`);
                else
                    errorAlert(`Error performing action: ${error}`);
            })
            .finally(() => setLoading(false));
    };

    return (
        <ContentTheme title={t('GoodsReceiptSupervisor')} icon={<SupervisedUserCircleIcon/>}>
            <DocumentForm onError={errorAlert} onNewDocument={newDocument => setDocuments(prevDocs => [newDocument, ...prevDocs])}/>
            <br/>
            <br/>
            {documents.map(doc => <DocumentCard key={doc.id} doc={doc} handleAction={handleAction}/>)}
            <ConfirmationDialog
                title={t('ConfirmAction')}
                text={
                    StringFormat((actionType === 'approve' ?
                        t('ConfirmFinishDocument') :
                        t('ConfirmCancelDocument')), selectedDocumentId)
                }
                open={dialogOpen}
                reverse={true}
                onClose={() => setDialogOpen(false)}
                onConfirm={handleConfirmAction}
            />
            <Dialog
                className="footerPartNoPadding"
                ref={dialogRef}
                footer={<Bar design="Footer" endContent={
                    <Button onClick={() => dialogRef?.current?.close()}>{t('Close')}</Button>}/>
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
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )
}
