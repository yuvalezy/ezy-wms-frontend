import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../Components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardHeader, Icon, List, StandardListItem, Button} from "@ui5/webcomponents-react";
import {Document} from "../../../Assets/Document";
import {useObjectName} from "../../../Assets/ObjectName";
import {Authorization} from "../../../Assets/Authorization";
import {useDocumentStatusToString} from "../../../Assets/DocumentStatusString";
import {Counting} from "../../../Assets/Counting";
import {Status} from "../../../Assets/Common";

type CountingCardProps = {
    doc: Counting,
    handleAction: (docId: number, action: 'approve' | 'cancel' | 'qrcode') => void
}

const CountingCard: React.FC<CountingCardProps> = ({doc, handleAction}) => {
    const {t} = useTranslation();
    const o = useObjectName();
    const navigate = useNavigate();
    const {user} = useAuth();

    function handleOpen(id: number) {
        navigate(`/counting/${id}`);
    }

    let handleOpenLink = user?.authorizations?.includes(Authorization.COUNTING);

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
                <StandardListItem><strong>{t('docDate')}:</strong> {new Date(doc.date).toLocaleDateString()}</StandardListItem>
                <StandardListItem><strong>{t('createdBy')}:</strong> {doc.employee.name}</StandardListItem>
                <StandardListItem><strong>{t('status')}:</strong> {documentStatusToString(doc.status)}</StandardListItem>
                <StandardListItem>
                    <a href="#" onClick={e => {
                        e.preventDefault();
                        navigate(`/countingSummaryReport/${doc.id}`)
                    }}>{t('countingSummaryReport')}</a>
                </StandardListItem>
                <StandardListItem>
                    {doc.status === Status.InProgress && (
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

export default CountingCard;