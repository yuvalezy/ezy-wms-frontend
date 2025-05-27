import React from "react";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faFileAlt, faTruckLoading, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { Document } from "@/Assets/Document";
import { useObjectName } from "@/Assets/ObjectName";
import { Authorization } from "@/Assets/Authorization";
import { useDocumentStatusToString } from "@/Assets/DocumentStatusString";
import { Status } from "@/Assets/Common";
import { activeStatuses, processStatuses, useHandleOpen } from "../Data/GoodsReceiptUtils";
import { useDateTimeFormat } from "@/Assets/DateFormat";
import { Separator } from "@/components/ui/separator";

type DocumentCardProps = {
    doc: Document,
    supervisor?: boolean,
    action?: (docId: number, action: 'approve' | 'cancel') => void,
    docDetails: (doc: Document) => void
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, supervisor = false, action, docDetails }) => {
    const { t } = useTranslation();
    const o = useObjectName();
    const { dateFormat } = useDateTimeFormat();
    const { user } = useAuth();
    const handleOpen = useHandleOpen();

    const handleOpenLink = user?.authorizations?.includes(Authorization.GOODS_RECEIPT);

    const documentStatusToString = useDocumentStatusToString();

    function documentDetailsClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        e.preventDefault();
        docDetails(doc);
    }

    return (
        <Card className="mb-4 shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">
                    {doc.name ? `${t('id')} : ${doc.name}` : `${t('number')}: ${doc.id}`}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <strong>{t('number')}:</strong> {handleOpenLink ? (
                            <a href="#" onClick={(e) => handleOpen(e, 'open', doc.id)} className="text-blue-600 hover:underline">
                                {doc.id}
                            </a>
                        ) : (
                            doc.id
                        )}
                    </div>
                    {doc.businessPartner && (
                        <div>
                            <strong>{t('vendor')}:</strong> {doc.businessPartner?.name ?? doc.businessPartner?.code}
                        </div>
                    )}
                    {doc.specificDocuments && doc.specificDocuments.length > 0 && (
                        <div className="col-span-2">
                            <strong>{t('documentsList')}:</strong>{' '}
                            <a href="#" onClick={documentDetailsClick} className="text-blue-600 hover:underline">
                                {doc.specificDocuments.map((value, index) => (
                                    <React.Fragment key={index}>
                                        {index > 0 && ', '}
                                        {o(value.objectType)} #{value.documentNumber}
                                    </React.Fragment>
                                ))}
                            </a>
                        </div>
                    )}
                    <div>
                        <strong>{t('docDate')}:</strong> {dateFormat(new Date(doc.date))}
                    </div>
                    <div>
                        <strong>{t('createdBy')}:</strong> {doc.employee.name}
                    </div>
                    <div>
                        <strong>{t('status')}:</strong> {documentStatusToString(doc.status)}
                    </div>
                </div>

                {supervisor && (
                    <>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Button variant="outline" className="w-full" onClick={e => handleOpen(e, 'all', doc.id)}>
                                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                                {t('goodsReceiptReport')}
                            </Button>
                            {activeStatuses.includes(doc.status) && (
                                <Button variant="outline" className="w-full" onClick={e => handleOpen(e, 'vs', doc.id)}>
                                    <FontAwesomeIcon icon={faTruckLoading} className="mr-2" />
                                    {t('goodsReceiptVSExit')}
                                </Button>
                            )}
                            {processStatuses.includes(doc.status) && (
                                <Button variant="outline" className="w-full" onClick={e => handleOpen(e, 'diff', doc.id)}>
                                    <FontAwesomeIcon icon={faExchangeAlt} className="mr-2" />
                                    {t('differencesReport')}
                                </Button>
                            )}
                            {doc.status === Status.InProgress && (
                                <Button className="w-full" onClick={() => action?.(doc.id, 'approve')}>
                                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                    {t('finish')}
                                </Button>
                            )}
                            <Button variant="destructive" className="w-full" onClick={() => action?.(doc.id, 'cancel')}>
                                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                {t('cancel')}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default DocumentCard;
