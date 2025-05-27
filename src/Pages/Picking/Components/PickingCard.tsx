import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../components/AppContext";
import {useTranslation} from "react-i18next";
import {Button, Card, CardHeader, Icon, List, ProgressIndicator, StandardListItem} from "@ui5/webcomponents-react";
import {Authorization} from "../../../Assets/Authorization";
import {PickingDocument} from "../Data/PickingDocument";
import {useDateTimeFormat} from "../../../Assets/DateFormat";

type PickingCardProps = {
  picking: PickingDocument,
  onAction?: (id: PickingDocument, action: 'qrcode') => void,
  onUpdatePick?: (picking: PickingDocument) => void,
  supervisor?: boolean
}

const PickingCard: React.FC<PickingCardProps> = ({picking, onAction, onUpdatePick, supervisor = false}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();

  function handleOpen(id: number) {
    navigate(`/pick/${id}`);
  }

  let handleOpenLink = user?.authorizations?.includes(Authorization.PICKING);

  return (
    <Card key={picking.entry} header={<CardHeader titleText={`${t('id')}`}/>}>
      <List>
        <StandardListItem>
          {handleOpenLink && (<a href="#" onClick={e => {
            e.preventDefault();
            handleOpen(picking.entry)
          }}><strong>{t('number')}:</strong> {picking.entry}</a>)}
          {!handleOpenLink && (<><strong>{t('date')}:</strong> {dateFormat(new Date(picking.date))}</>)}
          {/*<a style={{float: 'right'}} onClick={(e) => onAction(picking, 'qrcode')}>*/}
          {/*    <Icon name="qr-code" />*/}
          {/*</a>*/}
        </StandardListItem>
        {picking.salesOrders > 0 &&
            <StandardListItem>
                <strong>{t('salesOrders')}</strong>: {picking.salesOrders}
            </StandardListItem>
        }
        {picking.invoices > 0 &&
            <StandardListItem>
                <strong>{t('invoices')}</strong>: {picking.invoices}
            </StandardListItem>
        }
        {picking.transfers > 0 &&
            <StandardListItem>
                <strong>{t('transferRequests')}</strong>: {picking.transfers}
            </StandardListItem>
        }
        <StandardListItem>
          <ProgressIndicator
            value={100 - picking.openQuantity * 100 / picking.quantity}
          />
        </StandardListItem>
        {picking.remarks &&
            <StandardListItem>
                <strong>{t('comment')}</strong>: {picking.remarks}
            </StandardListItem>
        }
        {supervisor && picking.updateQuantity > 0 &&
            <StandardListItem>
                <div style={{textAlign: 'center'}}>
                    <Button onClick={() => onUpdatePick?.(picking)} type="Button" icon="accept">{t("update")}</Button>
                </div>
            </StandardListItem>
        }
      </List>
    </Card>
  );
}

export default PickingCard;
