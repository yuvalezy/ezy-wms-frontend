import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../../Components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardHeader, Icon, List, StandardListItem} from "@ui5/webcomponents-react";
import {Authorization} from "../../../Assets/Authorization";
import {PickingDocument} from "../Data/PickingDocument";

type PickingCardProps = {
    picking: PickingDocument,
    handleAction: (id: PickingDocument, action: 'qrcode') => void
}

const PickingCard: React.FC<PickingCardProps> = ({picking, handleAction}) => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {user} = useAuth();

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
                    {!handleOpenLink && (<><strong>{t('date')}:</strong> {new Date(picking.date).toLocaleDateString()}</>)}
                    <a style={{float: 'right'}} onClick={(e) => handleAction(picking, 'qrcode')}>
                        <Icon name="qr-code" />
                    </a>
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
                {picking.remarks &&
                    <StandardListItem>
                        <strong>{t('comment')}</strong>: {picking.remarks}
                    </StandardListItem>
                }
            </List>
        </Card>
    );
}

export default PickingCard;
