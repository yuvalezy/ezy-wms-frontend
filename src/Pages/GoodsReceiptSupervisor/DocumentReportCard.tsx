import React from "react";
import {Card, CardContent, createTheme, Typography,} from "@mui/material";
import {Document, DocumentStatus, documentStatusToString} from "./Document";
import {TextValue} from "../../assets/TextValue";
import {useNavigate} from "react-router-dom";

const theme = createTheme();

type DocumentReportCardProps = {
    doc: Document
}

const DocumentReportCard: React.FC<DocumentReportCardProps> = ({doc}) => {
    const navigate = useNavigate();

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
                <Typography variant="h6">{TextValue.ID}: {doc.name}</Typography>
                <Typography color="textSecondary">{TextValue.Number}: {doc.id}</Typography>
                <Typography color="textSecondary">{TextValue.Vendor}: {doc.businessPartner?.name ?? doc.businessPartner?.code}</Typography>
                <Typography
                    color="textSecondary">{TextValue.DocDate}: {new Date(doc.date).toLocaleDateString()}</Typography>
                <Typography color="textSecondary">{TextValue.CreatedBy}: {doc.employee.name}</Typography>
                <Typography
                    color="textSecondary">{TextValue.Status}: {documentStatusToString(doc.status)}</Typography>
                <a href="#" onClick={e => {
                    e.preventDefault();
                    handleOpen('all', doc.id)
                }}>{TextValue.GoodsReceiptReport}</a>
                <br/>
                {doc.status === DocumentStatus.Finished &&
                    <a href="#" onClick={e => {
                        e.preventDefault();
                        handleOpen('vs', doc.id)
                    }}>{TextValue.GoodsReceiptVSExit}</a>
                }
            </CardContent>
        </Card>
    );
}

export default DocumentReportCard;
