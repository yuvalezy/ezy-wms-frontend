import React, {useEffect, useState} from "react";
import {
    createTheme,
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
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import ContentTheme from "../Components/ContentTheme";
import {Functions} from "../assets/Functions";
import axios from "axios";
import config from "../config";

interface Document {
    id: number;
    name: string;
    date: string;
    employee: Employee;
    status: number;
    statusDate?: string;
    statusEmployee?: Employee;
}

interface Employee {
    id: number;
    name: string;
}

enum DocumentStatus {
    Open       = 'O'.charCodeAt(0),
    Processing = 'P'.charCodeAt(0),
    Finished   = 'F'.charCodeAt(0),
    Cancelled  = 'C'.charCodeAt(0),
    InProgress = 'I'.charCodeAt(0)
}

type Action = 'approve' | 'cancel' | 'qrcode';

export default function GoodsReceiptSupervisor() {
    const theme = createTheme();
    const {user} = useAuth();

    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<Action | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [docNameInput, setDocNameInput] = useState<string | ''>('');  // For new document input
    const [qrOpen, setQrOpen] = useState(false);

    useEffect(() => {
        const access_token = localStorage.getItem('token');
        axios.get<Document[]>(`${config.baseURL}/api/GoodsReceipt/Documents?statuses=Open, InProgress&OrderBy=ID&Desc=true`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(response => {
                setDocuments(response.data.map((v: any) => ({
                    id: v.ID,
                    name: v.Name,
                    date: v.Date,
                    employee: {
                        id: v.Employee.ID,
                        name: v.Employee.Name
                    },
                    status: v.Status,
                    statusDate: v.StatusDate,
                    statusEmployee: {
                        id: v.StatusEmployee?.ID,
                        name: v.StatusEmployee?.Name
                    }
                })));
            })
            .catch(error => {
                console.error(`Error fetching documents: ${error}`);
            })
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const today = new Date().toISOString().split('T')[0];
        if (docNameInput === null || docNameInput === '') {
            alert(TextValue.IDRequired);
            return;
        }
        //todo validate no duplicate document name
        const newDocument: Document = {
            id: documents[0].id + 1,
            name: docNameInput,
            date: today,
            employee: {
                id: user!.id,
                name: user!.name,
            },
            status: 1
        };
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
                        status: actionType === 'approve' ? 1 : 2
                    };
                }
                return doc;
            });
        });
        setDialogOpen(false);
    };

    const handleQrClose = () => setQrOpen(false);

    return (
        <ContentTheme title={TextValue.GoodsReceiptSupervisor} icon={<SupervisedUserCircleIcon/>}>
            {DocumentForm()}
            {documents.map(DocumentCard)}
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
            {QRCodeDialog()}
        </ContentTheme>
    )

    function DocumentForm() {
        return (
            <form onSubmit={handleSubmit}><Box mb={1} style={{textAlign: 'center'}}>
                <TextField
                    fullWidth
                    required
                    label={TextValue.ID}
                    variant="outlined"
                    value={docNameInput}
                    onChange={e => setDocNameInput(e.target.value)}
                    inputProps={{maxLength: 50}}
                />
                <Box mt={1}>
                    <Button variant="contained" color="primary" type="submit">
                        <DescriptionIcon/>
                        {TextValue.Create}
                    </Button>
                </Box>
            </Box></form>
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
        return <Card key={doc.id} variant="outlined" sx={{marginBottom: theme.spacing(2), position: 'relative'}}>
            <Button
                style={{position: 'absolute', top: '8px', right: '0px', zIndex: 1}}
                onClick={() => handleAction(doc.id, 'qrcode')}
            >
                <QrCodeIcon/>
            </Button>
            <CardContent>
                <Typography variant="h6">{TextValue.ID}: {doc.name}</Typography>
                <Typography color="textSecondary">{TextValue.Number}: {doc.id}</Typography>
                <Typography color="textSecondary">{TextValue.DocDate}: {new Date(doc.date).toLocaleDateString()}</Typography>
                <Typography color="textSecondary">{TextValue.CreatedBy}: {doc.employee.name}</Typography>
                <Typography color="textSecondary">{TextValue.Status}: {doc.status === DocumentStatus.Open ? TextValue.Open : TextValue.InProgress}</Typography>
                <Box sx={{marginTop: theme.spacing(2), display: 'flex', gap: theme.spacing(1)}}>
                    <Button variant="contained" color="primary" onClick={() => handleAction(doc.id, 'approve')}>
                        <DoneIcon/>
                        {TextValue.Finish}
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => handleAction(doc.id, 'cancel')}>
                        <CancelIcon/>
                        {TextValue.Cancel}
                    </Button>
                </Box>
            </CardContent>
        </Card>;
    }
}
