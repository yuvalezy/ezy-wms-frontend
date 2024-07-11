import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../Components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardHeader, Icon, List, StandardListItem, Button} from "@ui5/webcomponents-react";
import {Document} from "../../../Assets/Document";
import {useObjectName} from "../../../Assets/ObjectName";
import {Authorization} from "../../../Assets/Authorization";
import {useDocumentStatusToString} from "../../../Assets/DocumentStatusString";
import {Status} from "../../../Assets/Common";
import {activeStatuses, processStatuses, useHandleOpen} from "../Data/GoodsReceiptUtils";
import {useDateTimeFormat} from "../../../Assets/DateFormat";

type DocumentCardProps = {
    doc: Document,
    supervisor: boolean,
    action: (docId: number, action: 'approve' | 'cancel' | 'qrcode') => void,
    docDetails: (doc: Document) => void
}

const DocumentCard: React.FC<DocumentCardProps> = ({doc, supervisor, action, docDetails}) => {
    const {t} = useTranslation();
    const o = useObjectName();
    const { dateFormat } = useDateTimeFormat();
    const {user} = useAuth();
    const handleOpen = useHandleOpen();

    const handleOpenLink = user?.authorizations?.includes(Authorization.GOODS_RECEIPT);

    const documentStatusToString = useDocumentStatusToString();

    function documentDetailsClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        e.preventDefault();
        docDetails(doc);
    }

    return (
        <Card key={doc.id} header={<CardHeader titleText={`${t('id')} : ${doc.name}`}/>}>
            <List>
                <StandardListItem>
                    {handleOpenLink && (<a href="#" onClick={(e) => handleOpen(e, 'open', doc.id)}><strong>{t('number')}:</strong> {doc.id}</a>)}
                    {!handleOpenLink && (<><strong>{t('number')}:</strong> {doc.id}</>)}
                    <a style={{float: 'right'}} onClick={(e) => action(doc.id, 'qrcode')}>
                        <Icon name="qr-code"/>
                    </a>
                </StandardListItem>
                {doc.businessPartner &&
                    <StandardListItem>
                        <strong>{t('vendor')}</strong>: {doc.businessPartner?.name ?? doc.businessPartner?.code}
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
                <StandardListItem><strong>{t('docDate')}:</strong> {dateFormat(new Date(doc.date))}</StandardListItem>
                <StandardListItem><strong>{t('createdBy')}:</strong> {doc.employee.name}</StandardListItem>
                <StandardListItem><strong>{t('status')}:</strong> {documentStatusToString(doc.status)}</StandardListItem>
                {supervisor &&
                    <>
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
                        <StandardListItem>
                            {doc.status === Status.InProgress && (
                                <Button style={{marginRight: '10px'}} color="primary" onClick={() => action(doc.id, 'approve')} icon="complete">
                                    {t('finish')}
                                </Button>)}
                            <Button icon="cancel" onClick={() => action(doc.id, 'cancel')}>
                                {t('cancel')}
                            </Button>
                        </StandardListItem>
                    </>
                }
            </List>
        </Card>
    );
}

export default DocumentCard;
