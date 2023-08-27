import React from "react";
import {
    createTheme,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
} from "@mui/material";
import {Document, DocumentStatus, documentStatusToString} from "./Document";
import QrCodeIcon from '@mui/icons-material/QrCode';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import {TextValue} from "../../assets/TextValue";

const theme = createTheme();

type DocumentCardProps = {
    doc: Document,
    handleAction: (docId: number, action: 'approve' | 'cancel' | 'qrcode') => void
}

const DocumentCard: React.FC<DocumentCardProps> = ({doc, handleAction}) => {
    return (
        <Card key={doc.id} variant="outlined" sx={{marginBottom: theme.spacing(2), position: 'relative'}}>
            <Button
                style={{position: 'absolute', top: '8px', right: '0px', zIndex: 1}}
                onClick={() => handleAction(doc.id, 'qrcode')}
            >
                <QrCodeIcon/>
            </Button>
            <CardContent>
                <Typography variant="h6">{TextValue.ID}: {doc.name}</Typography>
                <Typography color="textSecondary">{TextValue.Number}: {doc.id}</Typography>
                <Typography color="textSecondary">{TextValue.Vendor}: {doc.businessPartner?.name??doc.businessPartner?.code}</Typography>
                <Typography
                    color="textSecondary">{TextValue.DocDate}: {new Date(doc.date).toLocaleDateString()}</Typography>
                <Typography color="textSecondary">{TextValue.CreatedBy}: {doc.employee.name}</Typography>
                <Typography
                    color="textSecondary">{TextValue.Status}: {documentStatusToString(doc.status)}</Typography>
                <Box sx={{marginTop: theme.spacing(2), display: 'flex', gap: theme.spacing(1)}}>
                    {doc.status === DocumentStatus.InProgress && (
                        <Button variant="contained" color="primary" onClick={() => handleAction(doc.id, 'approve')}>
                            <DoneIcon/>
                            {TextValue.Finish}
                        </Button>)}
                    <Button variant="contained" color="secondary" onClick={() => handleAction(doc.id, 'cancel')}>
                        <CancelIcon/>
                        {TextValue.Cancel}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

export default DocumentCard;
