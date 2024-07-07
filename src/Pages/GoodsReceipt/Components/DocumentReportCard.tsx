import React from "react";
import {Card, CardHeader, List, StandardListItem} from "@ui5/webcomponents-react";
import {useTranslation} from "react-i18next";
import {Document} from "../../../Assets/Document";
import {useDocumentStatusToString} from "../../../Assets/DocumentStatusString";
import {activeStatuses, processStatuses, useHandleOpen} from "../Data/GoodsReceiptUtils";

type DocumentReportCardProps = {
    doc: Document
}

const DocumentReportCard: React.FC<DocumentReportCardProps> = ({doc}) => {
    const {t} = useTranslation();
    const documentStatusToString = useDocumentStatusToString();
    const handleOpen = useHandleOpen();

    return (
        <Card key={doc.id}
              header={<CardHeader titleText={`${t('id')}: ${doc.name}`}/>}
        >
            <List>
                <StandardListItem><strong>{t('number')}:</strong> {doc.id}</StandardListItem>
                <StandardListItem><strong>{t('vendor')}:</strong> {doc.businessPartner?.name ?? doc.businessPartner?.code}
                </StandardListItem>
                <StandardListItem><strong>{t('docDate')}:</strong> {new Date(doc.date).toLocaleDateString()}
                </StandardListItem>
                <StandardListItem><strong>{t('createdBy')}:</strong> {doc.employee.name}</StandardListItem>
                <StandardListItem><strong>{t('status')}:</strong> {documentStatusToString(doc.status)}
                </StandardListItem>
                {doc.statusDate &&
                    <StandardListItem><strong>{t('statusDate')}:</strong> {new Date(doc.statusDate).toLocaleDateString()}
                    </StandardListItem>}
                <StandardListItem>
                    <a href="#" onClick={e => handleOpen(e, 'all', doc.id)}>{t('goodsReceiptReport')}</a>
                </StandardListItem>
                {activeStatuses.includes(doc.status) &&
                    <StandardListItem>
                        <a href="#" onClick={e => handleOpen(e, 'vs', doc.id)}>{t('goodsReceiptVSExit')}</a>
                    </StandardListItem>
                }
                {processStatuses.includes(doc.status) &&
                    <StandardListItem>
                        <a href="#" onClick={e => handleOpen(e, 'diff', doc.id)}>{t('differencesReport')}</a>
                    </StandardListItem>
                }
            </List>
        </Card>
    );
}

export default DocumentReportCard;
