import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardHeader, List, StandardListItem, Button} from "@ui5/webcomponents-react";
import {Authorization} from "@/Assets/Authorization";
import {useDocumentStatusToString} from "@/Assets/DocumentStatusString";
import {Counting} from "@/Assets/Counting";
import {Status} from "@/Assets/Common";
import {useDateTimeFormat} from "@/Assets/DateFormat";

type CountingCardProps = {
  doc: Counting,
  handleAction?: (docId: number, action: 'approve' | 'cancel') => void,
  supervisor?: boolean
}

const CountingCard: React.FC<CountingCardProps> = ({doc, handleAction, supervisor = false}) => {
  const {t} = useTranslation();
  const {dateFormat} = useDateTimeFormat();
  const navigate = useNavigate();
  const {user} = useAuth();

  function handleOpen(id: number) {
    navigate(`/counting/${id}`);
  }

  let handleOpenLink = user?.authorizations?.includes(Authorization.COUNTING);

  const documentStatusToString = useDocumentStatusToString();

  return (
    <Card key={doc.id} header={doc.name ? <CardHeader titleText={`${t('id')} : ${doc.name}`}/> : undefined}>
      <List>
        <StandardListItem>
          {handleOpenLink && (<a href="#" onClick={e => {
            e.preventDefault();
            handleOpen(doc.id)
          }}><strong>{t('number')}:</strong> {doc.id}</a>)}
          {!handleOpenLink && (<><strong>{t('number')}:</strong> {doc.id}</>)}
        </StandardListItem>
        <StandardListItem><strong>{t('docDate')}:</strong> {dateFormat(new Date(doc.date))}</StandardListItem>
        <StandardListItem><strong>{t('createdBy')}:</strong> {doc.employee.name}</StandardListItem>
        <StandardListItem><strong>{t('status')}:</strong> {documentStatusToString(doc.status)}</StandardListItem>
        {supervisor && <>
            <StandardListItem>
                <a href="#" onClick={e => {
                  e.preventDefault();
                  navigate(`/countingSummaryReport/${doc.id}`)
                }}>{t('countingSummaryReport')}</a>
            </StandardListItem>
            <StandardListItem>
              {doc.status === Status.InProgress && (
                <Button style={{marginRight: '10px'}} color="primary" onClick={() => handleAction?.(doc.id, 'approve')}
                        icon="complete">
                  {t('finish')}
                </Button>)}
                <Button icon="cancel" onClick={() => handleAction?.(doc.id, 'cancel')}>
                  {t('cancel')}
                </Button>
            </StandardListItem>
        </>}
      </List>
    </Card>
  );
}

export default CountingCard;