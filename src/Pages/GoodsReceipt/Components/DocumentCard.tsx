import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../Components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardHeader, Icon, List, StandardListItem, Button} from "@ui5/webcomponents-react";
import {Document, DocumentStatus} from "../../../Assets/Document";
import {useObjectName} from "../../../Assets/ObjectName";
import {Authorization} from "../../../Assets/Authorization";
import {useDocumentStatusToString} from "../../../Assets/DocumentStatusString";

type DocumentCardProps = {
    doc: Document,
    handleAction: (docId: number, action: 'approve' | 'cancel' | 'qrcode') => void
}

const DocumentCard: React.FC<DocumentCardProps> = ({doc, handleAction}) => {
    const {t} = useTranslation();
    const o = useObjectName();
    const navigate = useNavigate();
    const {user} = useAuth();

    function handleOpen(id: number) {
        navigate(`/goodsReceipt/${id}`);
    }

    let handleOpenLink = user?.authorizations?.includes(Authorization.GOODS_RECEIPT);

    const documentStatusToString = useDocumentStatusToString();

    return (
        <Card key={doc.id} header={<CardHeader titleText={`${t('id')} : ${doc.name}`}/>}>
            <List>
                <StandardListItem>
                    {handleOpenLink && (<a href="#" onClick={e => {
                        e.preventDefault();
                        handleOpen(doc.id)
                    }}><strong>{t('number')}:</strong> {doc.id}</a>)}
                    {!handleOpenLink && (<><strong>{t('number')}:</strong> {doc.id}</>)}
                    <a style={{float: 'right'}} onClick={(e) => handleAction(doc.id, 'qrcode')}>
                        <Icon name="qr-code" />
                    </a>
                </StandardListItem>
                {doc.businessPartner &&
                    <StandardListItem>
                        <strong>{t('vendor')}</strong>: {doc.businessPartner?.name ?? doc.businessPartner?.code}
                    </StandardListItem>
                }
                {doc.specificDocuments && doc.specificDocuments.length > 0 &&
                    <StandardListItem><strong>{t('documentsList')}: </strong>
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
                        }</StandardListItem>}
                <StandardListItem><strong>{t('docDate')}:</strong> {new Date(doc.date).toLocaleDateString()}</StandardListItem>
                <StandardListItem><strong>{t('createdBy')}:</strong> {doc.employee.name}</StandardListItem>
                <StandardListItem><strong>{t('status')}:</strong> {documentStatusToString(doc.status)}</StandardListItem>
                <StandardListItem>
                    {doc.status === DocumentStatus.InProgress && (
                        <Button style={{marginRight: '10px'}} color="primary" onClick={() => handleAction(doc.id, 'approve')} icon="complete">
                            {t('finish')}
                        </Button>)}
                    <Button icon="cancel" onClick={() => handleAction(doc.id, 'cancel')}>
                        {t('cancel')}
                    </Button>
                </StandardListItem>
            </List>
        </Card>
    );
}

export default DocumentCard;
