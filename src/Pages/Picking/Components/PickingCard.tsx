import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {Authorization} from "@/assets/Authorization";
import {PickingDocument} from "@/pages/Picking/data/PickingDocument";
import {useDateTimeFormat} from "@/assets/DateFormat";
import { CheckCircle } from "lucide-react";
import {formatNumber} from "@/lib/utils";

type PickingCardProps = {
  picking: PickingDocument,
  onUpdatePick?: (picking: PickingDocument) => void,
  supervisor?: boolean
}

const PickingCard: React.FC<PickingCardProps> = ({picking, onUpdatePick, supervisor = false}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();

  function handleOpen(id: number) {
    navigate(`/pick/${id}`);
  }

  let handleOpenLink = user?.authorizations?.includes(Authorization.PICKING);
  const progressValue = picking.quantity > 0 ? 100 - (picking.openQuantity * 100 / picking.quantity) : 0;

  return (
    <Card key={picking.entry} className="mb-4 shadow-lg">
      <CardHeader>
        <CardTitle>{`${t('id')}`}</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            {handleOpenLink ? (
              <a href="#" onClick={e => { e.preventDefault(); handleOpen(picking.entry); }} className="text-blue-600 hover:underline">
                <span className="font-semibold">{t('number')}:</span> {picking.entry}
              </a>
            ) : (
              <>
                <span className="font-semibold">{t('date')}:</span> {dateFormat(new Date(picking.date))}
              </>
            )}
          </li>
          {picking.salesOrders > 0 &&
            <li className="flex justify-between">
                <span className="font-semibold">{t('salesOrders')}:</span> {picking.salesOrders}
            </li>
          }
          {picking.invoices > 0 &&
            <li className="flex justify-between">
                <span className="font-semibold">{t('invoices')}:</span> {picking.invoices}
            </li>
          }
          {picking.transfers > 0 &&
            <li className="flex justify-between">
                <span className="font-semibold">{t('transferRequests')}:</span> {picking.transfers}
            </li>
          }
          <li className="pt-2">
            <Progress value={progressValue} className="w-full" />
            <p className="text-xs text-muted-foreground text-center mt-1">{formatNumber(progressValue, 0)}% {t('complete')}</p>
          </li>
          {picking.remarks &&
            <li className="pt-2 border-t mt-2">
                <span className="font-semibold">{t('comment')}:</span> {picking.remarks}
            </li>
          }
        </ul>
      </CardContent>
      {supervisor && picking.updateQuantity > 0 &&
        <CardFooter className="flex justify-center pt-4 border-t">
            <Button onClick={() => onUpdatePick?.(picking)}>
                <CheckCircle className="mr-2 h-4 w-4" />{t("update")}
            </Button>
        </CardFooter>
      }
    </Card>
  );
}

export default PickingCard;
