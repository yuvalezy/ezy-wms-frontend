import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardHeader, List, StandardListItem, Button, ProgressIndicator} from "@ui5/webcomponents-react";
import {Authorization} from "../../../Assets/Authorization";
import {useDocumentStatusToString} from "../../../Assets/DocumentStatusString";
import {TransferDocument} from "../Data/TransferDocument";
import {Status} from "../../../Assets/Common";
import {useDateTimeFormat} from "../../../Assets/DateFormat";

type TransferCardProps = {
  doc: TransferDocument,
  onAction?: (id: number, action: 'approve' | 'cancel' | 'qrcode') => void,
  supervisor?: boolean
}

const TransferCard: React.FC<TransferCardProps> = ({doc, onAction, supervisor = false}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();

  function handleOpen(id: number) {
    navigate(`/transfer/${id}`);
  }

  let handleOpenLink = user?.authorizations?.includes(Authorization.TRANSFER);

  const documentStatusToString = useDocumentStatusToString();

  return (
    <Card key={doc.id} header={doc.name ? <CardHeader titleText={`${t('id')} : ${doc.name}`}/>: undefined}>
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
        {doc.comments && <StandardListItem><strong>{t('comment')}:</strong> {doc.comments}</StandardListItem>}
        <StandardListItem>
          <ProgressIndicator value={doc.progress ?? 0}/>
        </StandardListItem>
        {supervisor && <StandardListItem>
          {doc.status === Status.InProgress && doc.progress === 100 && (
            <Button style={{marginRight: '10px'}} color="primary" onClick={() => onAction?.(doc.id, 'approve')}
                    icon="complete">
              {t('finish')}
            </Button>)}
          <Button icon="cancel" onClick={() => onAction?.(doc.id, 'cancel')}>
            {t('cancel')}
          </Button>
        </StandardListItem>}
      </List>
    </Card>
  );
}

export default TransferCard;
