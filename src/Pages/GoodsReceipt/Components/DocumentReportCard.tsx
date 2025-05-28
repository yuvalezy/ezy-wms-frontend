import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    const listItemClasses = "py-2 px-1 flex justify-between items-center border-b last:border-b-0";
    const linkClasses = "text-blue-600 hover:underline";

    return (
        <Card key={doc.id} className="mb-4 shadow-lg">
            <CardHeader>
                <CardTitle>{`${t('id')}: ${doc.name}`}</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
                <ul className="space-y-1 text-sm">
                    <li className={listItemClasses}>
                        <span className="font-semibold">{t('number')}:</span>
                        <span>{doc.id}</span>
                    </li>
                    {doc.businessPartner != null &&
                        <li className={listItemClasses}>
                            <span className="font-semibold">{t('vendor')}:</span>
                            <span>{doc.businessPartner.name ?? doc.businessPartner.code}</span>
                        </li>
                    }
                    {doc.specificDocuments && doc.specificDocuments.length > 0 &&
                        <li className={listItemClasses}>
                            <a href="#" onClick={documentDetailsClick} className={linkClasses}>
                                <strong className="font-semibold">{t('documentsList')}: </strong>
                                {doc.specificDocuments.map((value, index) => (
                                    <span key={index}>
                                        {index > 0 && ', '}
                                        {o(value.objectType)} #{value.documentNumber}
                                    </span>
                                ))}
                            </a>
                        </li>
                    }
                    <li className={listItemClasses}>
                        <span className="font-semibold">{t('docDate')}:</span>
                        <span>{dateFormat(new Date(doc.date))}</span>
                    </li>
                    <li className={listItemClasses}>
                        <span className="font-semibold">{t('createdBy')}:</span>
                        <span>{doc.employee.name}</span>
                    </li>
                    <li className={listItemClasses}>
                        <span className="font-semibold">{t('status')}:</span>
                        <span>{documentStatusToString(doc.status)}</span>
                    </li>
                    {doc.statusDate &&
                        <li className={listItemClasses}>
                            <span className="font-semibold">{t('statusDate')}:</span>
                            <span>{dateFormat(new Date(doc.statusDate))}</span>
                        </li>
                    }
                     <li className={listItemClasses}>
                        <a href="#" onClick={e => handleOpen(e, 'all', doc.id)} className={linkClasses}>{t('goodsReceiptReport')}</a>
                    </li>
                    {activeStatuses.includes(doc.status) &&
                        <li className={listItemClasses}>
                            <a href="#" onClick={e => handleOpen(e, 'vs', doc.id)} className={linkClasses}>{t('goodsReceiptVSExit')}</a>
                        </li>
                    }
                    {processStatuses.includes(doc.status) &&
                        <li className={listItemClasses}>
                            <a href="#" onClick={e => handleOpen(e, 'diff', doc.id)} className={linkClasses}>{t('differencesReport')}</a>
                        </li>
                    }
                </ul>
            </CardContent>
        </Card>
    );
}

export default DocumentReportCard;
