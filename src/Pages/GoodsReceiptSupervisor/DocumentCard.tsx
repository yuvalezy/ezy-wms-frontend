import React from "react";
import {Box, Button, Card, CardContent, createTheme, Typography,} from "@mui/material";
import {Document, DocumentStatus} from "./Document";
import QrCodeIcon from '@mui/icons-material/QrCode';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../Components/AppContext";
import {Authorization} from "../../assets/Authorization";
import {useTranslation} from "react-i18next";
import {useObjectName} from "../../assets/ObjectName";
import {useDocumentStatusToString} from "./DocumentStatusString";

const theme = createTheme();

type DocumentCardProps = {
    doc: Document,
    handleAction: (docId: number, action: 'approve' | 'cancel' | 'qrcode') => void
}

const DocumentCard: React.FC<DocumentCardProps> = ({doc, handleAction}) => {
    const {t} = useTranslation();
    const o =  useObjectName();
    const navigate = useNavigate();
    const {user} = useAuth();

    function handleOpen(id: number) {
        navigate(`/goodsReceipt/${id}`);
    }

    let handleOpenLink = user?.authorizations?.includes(Authorization.GOODS_RECEIPT);

    const documentStatusToString = useDocumentStatusToString();

    return (
        <Card key={doc.id} variant="outlined" sx={{marginBottom: theme.spacing(2), position: 'relative'}}>
            <Button
                style={{position: 'absolute', top: '8px', right: '0px', zIndex: 1}}
                onClick={() => handleAction(doc.id, 'qrcode')}
            >
                <QrCodeIcon/>
            </Button>
            <CardContent>
                <Typography variant="h6">{t('ID')}: {doc.name}</Typography>
                <Typography color="textSecondary">
                    {handleOpenLink && (<a href="#" onClick={e => {
                        e.preventDefault();
                        handleOpen(doc.id)
                    }}>{t('Number')}: {doc.id}</a>)}
                    {!handleOpenLink && (<span>{t('Number')}: {doc.id}</span>)}
                </Typography>
                {doc.businessPartner && <Typography color="textSecondary">{t('Vendor')}: {doc.businessPartner?.name ?? doc.businessPartner?.code}</Typography>}
                {doc.specificDocuments && doc.specificDocuments.length > 0 &&
                    <Typography color="textSecondary">{t('DocumentsList')}:&nbsp;
                        {
                            doc.specificDocuments.map(
                                (value) => {
                                    let index = doc.specificDocuments?.indexOf(value) ?? -1;
                                    return <span key={index}>
                                    {index > 0 && ', '}
                                    {o(value.objectType)} #{value.documentNumber}
                                </span>;
                                }
                            )
                        }</Typography>}
                <Typography
                    color="textSecondary">{t('DocDate')}: {new Date(doc.date).toLocaleDateString()}</Typography>
                <Typography color="textSecondary">{t('CreatedBy')}: {doc.employee.name}</Typography>
                <Typography
                    color="textSecondary">{t('Status')}: {documentStatusToString(doc.status)}</Typography>
                <Box sx={{marginTop: theme.spacing(2), display: 'flex', gap: theme.spacing(1)}}>
                    {doc.status === DocumentStatus.InProgress && (
                        <Button variant="contained" color="primary" onClick={() => handleAction(doc.id, 'approve')}>
                            <DoneIcon/>
                            {t('Finish')}
                        </Button>)}
                    <Button variant="contained" color="secondary" onClick={() => handleAction(doc.id, 'cancel')}>
                        <CancelIcon/>
                        {t('Cancel')}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

export default DocumentCard;
