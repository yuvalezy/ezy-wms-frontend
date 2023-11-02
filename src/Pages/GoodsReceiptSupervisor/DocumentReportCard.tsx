import React from "react";
import {Card, CardHeader, List, StandardListItem} from "@ui5/webcomponents-react";
import {Document, DocumentStatus} from "./Document";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useDocumentStatusToString} from "./DocumentStatusString";

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
        <Card key={doc.id}
              header={<CardHeader titleText={`${t('ID')}: ${doc.name}`}/>}
        >
            <List>
                <StandardListItem><strong>{t('Number')}:</strong> {doc.id}</StandardListItem>
                <StandardListItem><strong>{t('Vendor')}:</strong> {doc.businessPartner?.name ?? doc.businessPartner?.code}</StandardListItem>
                <StandardListItem><strong>{t('DocDate')}:</strong> {new Date(doc.date).toLocaleDateString()}</StandardListItem>
                <StandardListItem><strong>{t('CreatedBy')}:</strong> {doc.employee.name}</StandardListItem>
                <StandardListItem><strong>{t('Status')}:</strong> {documentStatusToString(doc.status)}</StandardListItem>
                <StandardListItem>
                    <a href="#" onClick={e => {
                        e.preventDefault();
                        handleOpen('all', doc.id)
                    }}>{t('GoodsReceiptReport')}</a>
                </StandardListItem>
                <StandardListItem>
                    {doc.status === DocumentStatus.Finished &&
                        <a href="#" onClick={e => {
                            e.preventDefault();
                            handleOpen('vs', doc.id)
                        }}>{t('GoodsReceiptVSExit')}</a>
                    }
                </StandardListItem>
            </List>
        </Card>
    );
}

export default DocumentReportCard;
