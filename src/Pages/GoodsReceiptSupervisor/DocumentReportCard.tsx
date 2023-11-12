import React from "react";
import {Card, CardHeader, List, StandardListItem} from "@ui5/webcomponents-react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useDocumentStatusToString} from "./DocumentStatusString";
import {Document, DocumentStatus} from "@Assets/Document";

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
              header={<CardHeader titleText={`${t('id')}: ${doc.name}`}/>}
        >
            <List>
                <StandardListItem><strong>{t('number')}:</strong> {doc.id}</StandardListItem>
                <StandardListItem><strong>{t('vendor')}:</strong> {doc.businessPartner?.name ?? doc.businessPartner?.code}</StandardListItem>
                <StandardListItem><strong>{t('docDate')}:</strong> {new Date(doc.date).toLocaleDateString()}</StandardListItem>
                <StandardListItem><strong>{t('createdBy')}:</strong> {doc.employee.name}</StandardListItem>
                <StandardListItem><strong>{t('status')}:</strong> {documentStatusToString(doc.status)}</StandardListItem>
                <StandardListItem>
                    <a href="#" onClick={e => {
                        e.preventDefault();
                        handleOpen('all', doc.id)
                    }}>{t('goodsReceiptReport')}</a>
                </StandardListItem>
                <StandardListItem>
                    {doc.status === DocumentStatus.Finished &&
                        <a href="#" onClick={e => {
                            e.preventDefault();
                            handleOpen('vs', doc.id)
                        }}>{t('goodsReceiptVSExit')}</a>
                    }
                </StandardListItem>
            </List>
        </Card>
    );
}

export default DocumentReportCard;
