import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../Components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardHeader, Icon, List, StandardListItem, Button} from "@ui5/webcomponents-react";
import {useObjectName} from "../../../Assets/ObjectName";
import {Authorization} from "../../../Assets/Authorization";
import {useDocumentStatusToString} from "../../../Assets/DocumentStatusString";
import {Transfer} from "../Data/Transfer";
import {Status} from "../../../Assets/Common";

type TransferCardProps = {
    doc: Transfer,
    onAction: (id: number, action: 'approve' | 'cancel' | 'qrcode') => void
}

const TransferCard: React.FC<TransferCardProps> = ({doc, onAction}) => {
    const {t} = useTranslation();
    const o = useObjectName();
    const navigate = useNavigate();
    const {user} = useAuth();

    function handleOpen(id: number) {
        navigate(`/transfer/${id}`);
    }

    let handleOpenLink = user?.authorizations?.includes(Authorization.TRANSFER);

    const documentStatusToString = useDocumentStatusToString();

    return (
        <Card key={doc.id} header={<CardHeader titleText={`${t('id')}`}/>}>
            <List>
                <StandardListItem>
                    {handleOpenLink && (<a href="#" onClick={e => {
                        e.preventDefault();
                        handleOpen(doc.id)
                    }}><strong>{t('number')}:</strong> {doc.id}</a>)}
                    {!handleOpenLink && (<><strong>{t('number')}:</strong> {doc.id}</>)}
                    <a style={{float: 'right'}} onClick={(e) => onAction(doc.id, 'qrcode')}>
                        <Icon name="qr-code" />
                    </a>
                </StandardListItem>
                <StandardListItem><strong>{t('docDate')}:</strong> {new Date(doc.date).toLocaleDateString()}</StandardListItem>
                <StandardListItem><strong>{t('createdBy')}:</strong> {doc.employee.name}</StandardListItem>
                <StandardListItem><strong>{t('status')}:</strong> {documentStatusToString(doc.status)}</StandardListItem>
                <StandardListItem>
                    {doc.status === Status.InProgress && (
                        <Button style={{marginRight: '10px'}} color="primary" onClick={() => onAction(doc.id, 'approve')} icon="complete">
                            {t('finish')}
                        </Button>)}
                    <Button icon="cancel" onClick={() => onAction(doc.id, 'cancel')}>
                        {t('cancel')}
                    </Button>
                </StandardListItem>
            </List>
        </Card>
    );
}

export default TransferCard;