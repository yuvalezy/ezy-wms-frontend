import React from "react";
import {Card, CardHeader, List, StandardListItem} from "@ui5/webcomponents-react";
import {useTranslation} from "react-i18next";
import {Document} from "../../../Assets/Document";
import {useDocumentStatusToString} from "../../../Assets/DocumentStatusString";
import {activeStatuses, processStatuses, useHandleOpen} from "../Data/GoodsReceiptUtils";
import {useObjectName} from "../../../Assets/ObjectName";
import {useDateTimeFormat} from "../../../Assets/DateFormat";

type DocumentReportCardProps = {
    doc: Document
    docDetails: (doc: Document) => void
}

const DocumentReportCard: React.FC<DocumentReportCardProps> = ({doc, docDetails}) => {
    const {t} = useTranslation();
    const { dateFormat } = useDateTimeFormat();
    const documentStatusToString = useDocumentStatusToString();
    const handleOpen = useHandleOpen();
    const o = useObjectName();

    function documentDetailsClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        e.preventDefault();
        docDetails(doc);
    }

    return (
        <Card key={doc.id}
              header={<CardHeader titleText={`${t('id')}: ${doc.name}`}/>}
        >
            <List>
                <StandardListItem><strong>{t('number')}:</strong> {doc.id}</StandardListItem>
                {doc.businessPartner != null &&
                <StandardListItem><strong>{t('vendor')}:</strong> {doc.businessPartner.name ?? doc.businessPartner.code}
                </StandardListItem>
                }
                {doc.specificDocuments && doc.specificDocuments.length > 0 &&
                    <StandardListItem><a href="#" onClick={documentDetailsClick}><strong>{t('documentsList')}: </strong>
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
                        }</a></StandardListItem>}
                <StandardListItem><strong>{t('docDate')}:</strong> {dateFormat(new Date(doc.date))}
                </StandardListItem>
                <StandardListItem><strong>{t('createdBy')}:</strong> {doc.employee.name}</StandardListItem>
                <StandardListItem><strong>{t('status')}:</strong> {documentStatusToString(doc.status)}
                </StandardListItem>
                {doc.statusDate &&
                    <StandardListItem><strong>{t('statusDate')}:</strong> {dateFormat(new Date(doc.statusDate))}
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
