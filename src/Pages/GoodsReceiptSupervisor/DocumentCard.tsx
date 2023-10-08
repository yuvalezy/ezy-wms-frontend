import React from "react";
import {Box, Button, Card, CardContent, createTheme, Typography,} from "@mui/material";
import {Document, DocumentStatus, documentStatusToString} from "./Document";
import QrCodeIcon from '@mui/icons-material/QrCode';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import {TextValue} from "../../assets/TextValue";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../Components/AppContext";
import {Authorization} from "../../assets/Authorization";

const theme = createTheme();

type DocumentCardProps = {
    doc: Document,
    handleAction: (docId: number, action: 'approve' | 'cancel' | 'qrcode') => void
}

const DocumentCard: React.FC<DocumentCardProps> = ({doc, handleAction}) => {
    const navigate = useNavigate();
    const {user} = useAuth();

    function handleOpen(id: number) {
        navigate(`/goodsReceipt/${id}`);
    }

    let handleOpenLink = user?.authorizations?.includes(Authorization.GOODS_RECEIPT);
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
                <Typography color="textSecondary">
                    {handleOpenLink && (<a href="#" onClick={e => {e.preventDefault(); handleOpen(doc.id)}}>{TextValue.Number}: {doc.id}</a>)}
                    {!handleOpenLink && (<span>{TextValue.Number}: {doc.id}</span>)}
                </Typography>
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
