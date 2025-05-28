import React from "react";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faFileAlt, faTruckLoading, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import {Document, DocumentItem} from "@/assets/Document";
import { useObjectName } from "@/assets/ObjectName";
import { Authorization } from "@/assets/Authorization";
import { useDocumentStatusToString } from "@/assets/DocumentStatusString";
import { Status } from "@/assets/Common";
import { activeStatuses, processStatuses, useHandleOpenOld } from "../Data/GoodsReceiptUtils";
import { useDateTimeFormat } from "@/assets/DateFormat";
import { Separator } from "@/components/ui/separator";
import InfoBox, {InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {useNavigate} from "react-router-dom";

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
    const handleOpen = useHandleOpenOld();
    const navigate = useNavigate();

    const handleOpenLink = user?.authorizations?.includes(Authorization.GOODS_RECEIPT);

    const openLink = () => navigate(`/goodsReceipt/${doc.id}`);

    const documentStatusToString = useDocumentStatusToString();

    const formatDocumentsList = (documents: DocumentItem[]) => {
        return documents.map((value, index) => (
          `${index > 0 ? ', ' : ''}${o(value.objectType)} #${value.documentNumber}`
        )).join('');
    }
    return (
        <Card>
            <CardContent className="text-sm">
                <InfoBox>
                    {doc.name && <InfoBoxValue label={t('id')} value={doc.name}/>}
                    <InfoBoxValue onClick={handleOpenLink ? openLink : undefined} label={t('number')} value={doc.id} />
                    {doc.businessPartner && (
                        <InfoBoxValue label={t('vendor')} value={doc.businessPartner.name ?? doc.businessPartner.code} />
                    )}
                    {doc.specificDocuments && doc.specificDocuments?.length > 0 && (
                      <InfoBoxValue label={t('documentsList')} value={formatDocumentsList(doc.specificDocuments)} onClick={() => docDetails(doc)}/>
                    )}
                </InfoBox>
                <SecondaryInfoBox>
                    <InfoBoxValue label={t('docDate')} value={dateFormat(new Date(doc.date))}/>
                    <InfoBoxValue label={t('createdAt')} value={doc.employee.name}/>
                    <InfoBoxValue label={t('createdBy')} value={documentStatusToString(doc.status)} />
                </SecondaryInfoBox>

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
