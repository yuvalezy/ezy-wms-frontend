import React, {useEffect, useState} from "react";
import {TextValue} from "../assets/TextValue";
import ConfirmationDialog from "../Components/ConfirmationDialog";
import {useAuth} from "../Components/AppContext";
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import ContentTheme from "../Components/ContentTheme";
import {StringFormat} from "../assets/Functions";
import DocumentForm from "./GoodsReceiptSupervisor/DocumentForm";
import {Document, fetchDocuments, createDocument, Action, documentAction} from "./GoodsReceiptSupervisor/Document";
import DocumentCard from "./GoodsReceiptSupervisor/DocumentCard";
import DocumentQRCodeDialog from "./GoodsReceiptSupervisor/DocumentQRCodeDialog";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";


export default function GoodsReceiptSupervisor() {
    const {user} = useAuth();
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<Action | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [cardCodeInput, setCardCodeInput] = useState<string | ''>('');
    const [docNameInput, setDocNameInput] = useState<string | ''>('');
    const [qrOpen, setQrOpen] = useState(false);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (docNameInput === null || docNameInput === '') {
            alert(TextValue.IDRequired);
            return;
        }
        setLoading(true);
        createDocument(cardCodeInput, docNameInput, user!)
            .then(newDocument => {
                setDocuments(prevDocs => [newDocument, ...prevDocs]);
                setDocNameInput('');  // Reset the input
            })
            .catch(error => {
                console.error(`Error creating document: ${error}`);
                errorAlert(`Error creating document: ${error.message}`);
            })
            .finally(() => setLoading(false));
    };

    const handleAction = (docId: number, action: Action) => {
        setSelectedDocumentId(docId);
        setActionType(action);
        if (action !== 'qrcode') {
            setDialogOpen(true);
        } else {
            setQrOpen(true);
        }
    };

    const handleConfirmAction = () => {
        setLoading(true);
        setDialogOpen(false);
        documentAction(selectedDocumentId!, actionType!, user!)
            .then(() => {
                setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocumentId));
                alert(actionType === 'approve' ? TextValue.Approved : TextValue.Cancelled);
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
        <ContentTheme loading={loading} title={TextValue.GoodsReceiptSupervisor} icon={<SupervisedUserCircleIcon/>}>
            <DocumentForm
                cardCodeInput={cardCodeInput}
                setCardCodeInput={setCardCodeInput}
                docNameInput={docNameInput}
                setDocNameInput={setDocNameInput}
                handleSubmit={handleSubmit}/>
            {documents.map(doc => <DocumentCard key={doc.id} doc={doc} handleAction={handleAction}/>)}
            <ConfirmationDialog
                title={TextValue.ConfirmAction}
                text={
                    StringFormat((actionType === 'approve' ?
                        TextValue.ConfirmFinishDocument :
                        TextValue.ConfirmCancelDocument), selectedDocumentId)
                }
                open={dialogOpen}
                reverse={true}
                onClose={() => setDialogOpen(false)}
                onConfirm={handleConfirmAction}
            />
            <DocumentQRCodeDialog open={qrOpen} onClose={() => setQrOpen(false)}
                                  selectedDocumentId={selectedDocumentId}/>
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )
}
