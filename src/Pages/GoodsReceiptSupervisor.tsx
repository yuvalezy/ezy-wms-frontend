import React, {useEffect, useState} from "react";
import {TextValue} from "../assets/TextValue";
import ConfirmationDialog from "../Components/ConfirmationDialog";
import {useAuth} from "../Components/AppContext";
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import ContentTheme from "../Components/ContentTheme";
import {Functions} from "../assets/Functions";
import DocumentForm from "./GoodsReceiptSupervisor/DocumentForm";
import {Document, fetchDocuments, createDocument, Action, documentAction} from "./GoodsReceiptSupervisor/Document";
import DocumentCard from "./GoodsReceiptSupervisor/DocumentCard";
import DocumentQRCodeDialog from "./GoodsReceiptSupervisor/DocumentQRCodeDialog";
import CircularProgressOverlay from "../Components/CircularProgressOverlay";


export default function GoodsReceiptSupervisor() {
    const {user} = useAuth();
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<Action | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [docNameInput, setDocNameInput] = useState<string | ''>('');  // For new document input
    const [qrOpen, setQrOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            fetchDocuments()
                .then(data => {
                    setDocuments(data);
                })
                .catch(error => {
                    console.error(`Error fetching documents: ${error}`);
                    alert(`Error fetching documents: ${error}`);
                })
                .finally(() => setLoading(false));
        }, 2000);
        //todo remove timeout
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (docNameInput === null || docNameInput === '') {
            alert(TextValue.IDRequired);
            return;
        }
        setLoading(true);
        setTimeout(() => {
            createDocument(docNameInput, user!)
                .then(newDocument => {
                    setDocuments(prevDocs => [newDocument, ...prevDocs]);
                    setDocNameInput('');  // Reset the input
                })
                .catch(error => {
                    console.error(`Error creating document: ${error}`);
                    alert(`Error creating document: ${error.message}`);
                })
                .finally(() => setLoading(false));
        }, 2000);
        //todo remove timeout
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
        setTimeout(() => {
            documentAction(selectedDocumentId!, actionType!, user!)
                .then(() => {
                    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocumentId));
                    alert(actionType === 'approve' ? TextValue.Approved : TextValue.Cancelled);
                })
                .catch(error => {
                    console.error(`Error performing action: ${error}`);
                    alert(`Error performing action: ${error}`);
                })
                .finally(() => setLoading(false));
        }, 2000);
    };

    return (
        <>
            {loading && <CircularProgressOverlay/>}
            <ContentTheme title={TextValue.GoodsReceiptSupervisor} icon={<SupervisedUserCircleIcon/>}>
                {<DocumentForm docNameInput={docNameInput} setDocNameInput={setDocNameInput}
                               handleSubmit={handleSubmit}/>}
                {documents.map(doc => <DocumentCard key={doc.id} doc={doc} handleAction={handleAction}/>)}
                <ConfirmationDialog
                    title={TextValue.ConfirmAction}
                    text={
                        Functions.StringFormat((actionType === 'approve' ?
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
            </ContentTheme>
        </>
    )
}
