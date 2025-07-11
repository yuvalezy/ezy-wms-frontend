import React, {useEffect} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription, useThemeContext} from "@/components";
import PickingCard from "@/features/picking/components/picking-card";
import {AlertCircle} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Progress} from "@/components/ui/progress";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {formatNumber} from "@/utils/number-utils";
import {PickingDocument, PickStatus} from "@/features/picking/data/picking";
import {pickingService} from "@/features/picking/data/picking-service";

export default function PickingUser() {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const [pickings, setPickings] = React.useState<PickingDocument[]>([]);
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();


  useEffect(() => {
    setLoading(true);
    pickingService.fetchPickings({status: [PickStatus.Released]})
      .then((data) => setPickings(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [setError, setLoading]);

  function handleOpen(id: number) {
    navigate(`/pick/${id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.PICKING);


  return (
    <ContentTheme title={t("picking")}>
      <div className="my-4">
        {pickings.length ? (
          <>
            {/* Mobile view - Cards */}
            <div className="block sm:hidden">
              {pickings.map((pick) => (
                <PickingCard key={pick.entry} picking={pick}/>
              ))}
            </div>
            
            {/* Desktop view - Table */}
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('number')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('salesOrders')}</TableHead>
                    <TableHead>{t('invoices')}</TableHead>
                    <TableHead>{t('transferRequests')}</TableHead>
                    <TableHead>{t('progress')}</TableHead>
                    <TableHead>{t('comment')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickings.map((pick) => {
                    const progressValue = pick.quantity > 0 ? 100 - (pick.openQuantity * 100 / pick.quantity) : 0;
                    return (
                      <TableRow key={pick.entry}>
                        <TableCell>
                          {handleOpenLink ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); handleOpen(pick.entry); }} className="text-blue-600 hover:underline">
                              {pick.entry}
                            </a>
                          ) : (
                            pick.entry
                          )}
                        </TableCell>
                        <TableCell>{dateFormat(new Date(pick.date))}</TableCell>
                        <TableCell>{pick.salesOrders || '-'}</TableCell>
                        <TableCell>{pick.invoices || '-'}</TableCell>
                        <TableCell>{pick.transfers || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={progressValue} className="w-20" />
                            <span className="text-xs">{formatNumber(progressValue, 0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{pick.remarks || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <Alert variant="information">
            <AlertCircle className="h-4 w-4"/>
            <AlertDescription>
              {t("noPickingData")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ContentTheme>
  );

}
