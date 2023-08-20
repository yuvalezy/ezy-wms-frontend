import React, {useState} from "react";
import MenuAppBar from "../Components/MenuAppBar";
import {
    createTheme,
    ThemeProvider,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    TextField,
    Dialog,
} from "@mui/material";

import {TextValue} from "../assets/TextValue";
import ConfirmationDialog from "../Components/ConfirmationDialog";
import {useAuth} from "../Components/AppContext";
import QRCode from "qrcode.react";
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import QrCodeIcon from '@mui/icons-material/QrCode';

interface Document {
    id: number;
    documentName: string;
    documentDate: string;
    createdBy: string;
    status: string;
}

type Action = 'approve' | 'cancel' | 'qrcode';

export default function GoodsReceiptSupervisor() {
    const theme = createTheme();
    const {user} = useAuth();

    const [documents, setDocuments] = useState<Document[]>([
        {id: 2, documentName: "Document 2", documentDate: "2023-08-10", createdBy: "User2", status: TextValue.Open},
        {id: 1, documentName: "Document 1", documentDate: "2023-08-09", createdBy: "User1", status: TextValue.Open},
    ]);

    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<Action | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [docNameInput, setDocNameInput] = useState<string | ''>('');  // For new document input
    const [qrOpen, setQrOpen] = useState(false);

    const handleNewDocument = () => {
        const today = new Date().toISOString().split('T')[0];
        const newDocument: Document = {
            id: documents[0].id + 1,
            documentName: `Document ${docNameInput}`,
            documentDate: today,
            createdBy: "",  // Assuming user contains the username
            status: TextValue.Open
        };
        if (user !== null)
            newDocument.createdBy = user.name;
        setDocuments(prevDocs => [newDocument, ...prevDocs]);
        setDocNameInput('');  // Reset the input
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
        setDocuments(prevDocs => {
            return prevDocs.map(doc => {
                if (doc.id === selectedDocumentId) {
                    //todo send status to back-end
                    return {
                        ...doc,
                        status: actionType === 'approve' ? TextValue.Approve : TextValue.Cancel
                    };
                }
                return doc;
            });
        });
        setDialogOpen(false);
    };

    const handleQrClose = () => setQrOpen(false);

    return (
        <ThemeProvider theme={theme}>
            <MenuAppBar title={TextValue.GoodsReceiptSupervisor} icon={<SupervisedUserCircleIcon/>}></MenuAppBar>
            <Box sx={{paddingTop: theme.spacing(8), paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2)}}>
                {DocumentForm()}
                {documents.map(DocumentCard)}
                <ConfirmationDialog
                    title={TextValue.ConfirmAction}
                    text={(actionType === 'approve' ? TextValue.ConfirmApproveDocument : TextValue.ConfirmCancelDocument)}
                    open={dialogOpen}
                    reverse={true}
                    onClose={() => setDialogOpen(false)}
                    onConfirm={handleConfirmAction}
                />
                {QRCodeDialog()}
            </Box>
        </ThemeProvider>
    )

    function DocumentForm() {
        return (
            <Box mb={1}>
                <TextField
                    fullWidth
                    required
                    label="Document Name"
                    variant="outlined"
                    value={docNameInput}
                    onChange={e => setDocNameInput(e.target.value)}
                />
                <Box mt={1}>
                    <Button variant="contained" color="primary" onClick={handleNewDocument}>
                        Create
                    </Button>
                </Box>
            </Box>
        )
    }

    function QRCodeDialog() {
        return (
            <Dialog open={qrOpen} onClose={handleQrClose}>
                <QRCode
                    value={`$GRPO_{selectedDocumentId}`}
                    width={200}
                    height={200}
                    color="black"
                    bgColor="white"
                />
            </Dialog>
        )
    }

    function DocumentCard(doc: Document) {
        return <Card key={doc.id} variant="outlined" sx={{marginBottom: theme.spacing(2)}}>
            <CardContent>
                <Typography variant="h6">{doc.documentName}</Typography>
                <Typography color="textSecondary">Document Date: {doc.documentDate}</Typography>
                <Typography color="textSecondary">Created By: {doc.createdBy}</Typography>
                <Typography color="textSecondary">Status: {doc.status}</Typography>
                <Box sx={{marginTop: theme.spacing(2), display: 'flex', gap: theme.spacing(1)}}>
                    <Button variant="contained" color="warning" onClick={() => handleAction(doc.id, 'qrcode')}>
                        <QrCodeIcon />
                        {TextValue.QRCode}
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => handleAction(doc.id, 'approve')}>
                        {TextValue.Approve}
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => handleAction(doc.id, 'cancel')}>
                        {TextValue.Cancel}
                    </Button>
                </Box>
            </CardContent>
        </Card>;
    }
}
