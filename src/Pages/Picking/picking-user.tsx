import React, {useEffect} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription, Button, useThemeContext} from "@/components";
import PickingCard from "@/features/picking/components/picking-card";
import {AlertCircle, CheckCircle} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Progress} from "@/components/ui/progress";
import {useNavigate} from "react-router";
import {useAuth} from "@/components/AppContext";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {formatNumber} from "@/utils/number-utils";
import {PickingDocument, PickStatus} from "@/features/picking/data/picking";
import {pickingService} from "@/features/picking/data/picking-service";
import {Skeleton} from "@/components/ui/skeleton";

export default function PickingUser() {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const [pickings, setPickings] = React.useState<PickingDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();


  useEffect(() => {
    setLoading(true);
    setIsLoading(true);
    pickingService.fetchPickings({status: [PickStatus.Released]})
      .then((data) => setPickings(data))
      .catch((err) => setError(err))
      .finally(() => {
        setLoading(false);
        setIsLoading(false);
      })
  }, [setError, setLoading]);

  function handleOpen(id: number) {
    navigate(`/pick/${id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.PICKING);

  // Skeleton components
  const MobileCardSkeleton = () => (
    <div className="bg-white rounded-lg border p-4 space-y-3 mb-4" aria-label="Loading...">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-2 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );

  const TableSkeleton = () => (
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
          {user?.settings.enablePickingCheck && <TableHead></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-2 w-20" />
                <Skeleton className="h-4 w-8" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            {user?.settings.enablePickingCheck && (
              <TableCell><Skeleton className="h-8 w-16" /></TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ContentTheme title={t("picking")}>
      <div className="my-4">
        {isLoading ? (
          <>
            {/* Mobile view - Card skeletons */}
            <div className="block sm:hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <MobileCardSkeleton key={index} />
              ))}
            </div>

            {/* Desktop view - Table skeleton */}
            <div className="hidden sm:block">
              <TableSkeleton />
            </div>
          </>
        ) : pickings.length ? (
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
                    {user?.settings.enablePickingCheck && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickings.map((pick) => {
                    const progressValue = pick.quantity > 0 ? 100 - (pick.openQuantity * 100 / pick.quantity) : 0;
                    return (
                      <TableRow key={pick.entry}>
                        <TableCell>
                          {handleOpenLink ? (
                            <a href="#" onClick={(e) => {
                              e.preventDefault();
                              handleOpen(pick.entry);
                            }} className="text-blue-600 hover:underline">
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
                            <Progress value={progressValue} className="w-20"/>
                            <span className="text-xs">{formatNumber(progressValue, 0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{pick.remarks || '-'}</TableCell>
                        {user?.settings.enablePickingCheck &&
                            <TableCell>
                              {pick.checkStarted &&
                                  <Button type="button" variant="outline" size="sm" className="cursor-pointer mr-2"
                                          disabled={progressValue === 0}
                                          onClick={() => navigate(`/pick/${pick.entry}/check`)}
                                  >
                                      <CheckCircle className="mr-2 h-4 w-4"/>{t("check")}
                                  </Button>}
                            </TableCell>
                        }
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
