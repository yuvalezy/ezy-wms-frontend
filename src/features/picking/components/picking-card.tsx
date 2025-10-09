import React from "react";
import {useNavigate} from "react-router";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {CheckCircle} from "lucide-react";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {formatNumber} from "@/utils/number-utils";
import {PickingDocument} from "@/features/picking/data/picking";
import {PickingCheckButton} from "@/features/picking/components/picking-check-button";

type PickingCardProps = {
  picking: PickingDocument,
  onUpdatePick?: (picking: PickingDocument) => void,
  onStartCheck?: (picking: PickingDocument) => void,
  supervisor?: boolean
}

const PickingCard: React.FC<PickingCardProps> = ({picking, onUpdatePick, onStartCheck, supervisor = false}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();

  function handleOpen(id: number) {
    navigate(`/pick/${id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.PICKING);
  const progressValue = picking.quantity > 0 ? 100 - (picking.openQuantity * 100 / picking.quantity) : 0;

  return (
    <Card key={picking.entry} className="mb-4 shadow-lg">
      <CardContent className="py-4">
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            {handleOpenLink ? (
              <a href="#" onClick={e => {
                e.preventDefault();
                handleOpen(picking.entry);
              }} className="text-blue-600 hover:underline">
                <span className="font-semibold">{t('number')}:</span> {picking.entry}
              </a>
            ) : (
              <>
                <span className="font-semibold">{t('date')}:</span> {dateFormat(new Date(picking.date))}
              </>
            )}
          </li>
          {picking.salesOrders != null && picking.salesOrders != '' &&
              <li className="flex justify-between">
                  <span className="font-semibold">{t('salesOrders')}:</span> {picking.salesOrders}
              </li>
          }
          {picking.invoices != null && picking.invoices != '' &&
              <li className="flex justify-between">
                  <span className="font-semibold">{t('invoices')}:</span> {picking.invoices}
              </li>
          }
          {picking.transfers != null && picking.transfers != '' &&
              <li className="flex justify-between">
                  <span className="font-semibold">{t('transferRequests')}:</span> {picking.transfers}
              </li>
          }
          <li className="pt-2">
            <Progress value={progressValue} className="w-full"/>
            <p
              className="text-xs text-muted-foreground text-center mt-1">{formatNumber(progressValue, 0)}% {t('complete')}</p>
          </li>
          {picking.remarks &&
              <li className="pt-2 border-t mt-2">
                  <span className="font-semibold">{t('comment')}:</span> {picking.remarks}
              </li>
          }
        </ul>
      </CardContent>
      {supervisor ? (
        <CardFooter className="flex justify-center gap-2 pt-4 border-t flex-wrap">
          {picking.updateQuantity > 0 && (
            <Button type="button" onClick={() => onUpdatePick?.(picking)}>
              <CheckCircle className="mr-2 h-4 w-4"/>{t("update")}
            </Button>
          )}
          {user?.settings.enablePickingCheck && progressValue > 0 && (
            <PickingCheckButton
              picking={picking}
              progressValue={progressValue}
              onStartCheck={onStartCheck}
              size="default"
              showViewButton={true}
            />
          )}
        </CardFooter>
      ) : (
        user?.settings.enablePickingCheck && picking.checkStarted ? (
          <CardFooter className="flex justify-center gap-2 pt-4 border-t">
            <Button type="button" variant="outline" className="cursor-pointer"
                    onClick={() => navigate(`/pick/${picking.entry}/check`)}
            >
              <CheckCircle className="mr-2 h-4 w-4"/>{t("viewCheck")}
            </Button>
          </CardFooter>
        ) : null
      )}
    </Card>
  );
}

export default PickingCard;
