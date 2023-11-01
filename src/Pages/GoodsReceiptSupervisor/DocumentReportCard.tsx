import React from "react";
import {Card, CardContent, createTheme, Typography,} from "@mui/material";
import {Document, DocumentStatus} from "./Document";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useDocumentStatusToString} from "./DocumentStatusString";

const theme = createTheme();

type DocumentReportCardProps = {
    doc: Document
}

const DocumentReportCard: React.FC<DocumentReportCardProps> = ({doc}) => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const documentStatusToString = useDocumentStatusToString();
    function handleOpen(type: string, id: number) {
        switch (type) {
            case 'all':
                navigate(`/goodsReceiptReportAll/${id}`);
                break;
            case 'vs':
                navigate(`/goodsReceiptVSExitReport/${id}`);
                break;
        }
    }

    return (
        <Card key={doc.id} variant="outlined" sx={{marginBottom: theme.spacing(2), position: 'relative'}}>
            <CardContent>
                <Typography variant="h6">{t('ID')}: {doc.name}</Typography>
                <Typography color="textSecondary">{t('Number')}: {doc.id}</Typography>
                <Typography color="textSecondary">{t('Vendor')}: {doc.businessPartner?.name ?? doc.businessPartner?.code}</Typography>
                <Typography
                    color="textSecondary">{t('DocDate')}: {new Date(doc.date).toLocaleDateString()}</Typography>
                <Typography color="textSecondary">{t('CreatedBy')}: {doc.employee.name}</Typography>
                <Typography
                    color="textSecondary">{t('Status')}: {documentStatusToString(doc.status)}</Typography>
                <a href="#" onClick={e => {
                    e.preventDefault();
                    handleOpen('all', doc.id)
                }}>{t('GoodsReceiptReport')}</a>
                <br/>
                {doc.status === DocumentStatus.Finished &&
                    <a href="#" onClick={e => {
                        e.preventDefault();
                        handleOpen('vs', doc.id)
                    }}>{t('GoodsReceiptVSExit')}</a>
                }
            </CardContent>
        </Card>
    );
}

export default DocumentReportCard;
