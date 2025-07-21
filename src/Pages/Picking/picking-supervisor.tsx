import ContentTheme from "@/components/ContentTheme";
import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {useThemeContext} from "@/components/ThemeContext";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {StringFormat} from "@/utils/string-utils";
import {toast} from "sonner";
import PickingCard from "@/features/picking/components/picking-card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {CheckCircle, RefreshCw, XCircle} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {MessageBox} from "@/components";

import {PickingDocument, SyncStatus} from "@/features/picking/data/picking";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {formatNumber} from "@/utils/number-utils";
import {pickingService} from "@/features/picking/data/picking-service";
import {PickingCheckButton} from "@/features/picking/components/picking-check-button";

export default function PickingSupervisor() {
  const {t} = useTranslation();
  const [pickings, setPickings] = useState<PickingDocument[]>([]);
  const {setLoading, setError} = useThemeContext();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PickingDocument | null>(null);

  function handleOpen(id: number) {
    navigate(`/pick/${id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.PICKING);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    pickingService.fetchPickings({displayCompleted: true})
      .then(values => setPickings(values))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  const handleUpdatePick = (picking: PickingDocument) => {
    if (picking.openQuantity > 0 && !window.confirm(StringFormat(t('pickOpenQuantityAlert'), picking.entry) + '\n' + t('confirmContinue'))) {
      return;
    }
    setLoading(true);
    pickingService.processPicking(picking.entry)
      .then(() => {
        toast.success(StringFormat(t("pickingUpdateSuccess"), picking.entry));
        loadData();
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }

  const handleCancelPick = (picking: PickingDocument) => {
    setSelectedDocument(picking);
    setDialogOpen(true);
  }

  const handleConfirmAction = () => {
    if (!selectedDocument)
      return;
    setLoading(true);
    pickingService.cancelPicking(selectedDocument.entry)
      .then(() => {
        toast.success(StringFormat(t("pickingCancelSuccess"), selectedDocument.entry));
        loadData();
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  const handleStartCheck = async (picking: PickingDocument) => {
    setLoading(true);
    try {
      await pickingService.startCheck(picking.entry);
      navigate(`/pick/${picking.entry}/check`);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const displaySalesOrders = pickings.find(picking => picking.salesOrders > 0) != null;
  const displayInvoices = pickings.find(picking => picking.invoices > 0) != null;
  const displayTransfers = pickings.find(picking => picking.transfers > 0) != null;

  return (
    <ContentTheme title={t("pickSupervisor")}>
      {pickings.length > 0 ? (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {pickings.map((pick) => (
              <PickingCard key={pick.entry} picking={pick} supervisor={true}
                           onUpdatePick={handleUpdatePick}
                           onStartCheck={handleStartCheck}/>
            ))}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('number')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  {displaySalesOrders && <TableHead>{t('salesOrders')}</TableHead>}
                  {displayInvoices && <TableHead>{t('invoices')}</TableHead>}
                  {displayTransfers && <TableHead>{t('transferRequests')}</TableHead>}
                  <TableHead>{t('progress')}</TableHead>
                  <TableHead>{t('comment')}</TableHead>
                  <TableHead className="text-right"></TableHead>
                  <TableHead className="text-right"></TableHead>
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
                      {displaySalesOrders && <TableCell>{pick.salesOrders || '-'}</TableCell>}
                      {displayInvoices && <TableCell>{pick.invoices || '-'}</TableCell>}
                      {displayTransfers && <TableCell>{pick.transfers || '-'}</TableCell>}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={progressValue} className="w-20"/>
                          <span className="text-xs">{formatNumber(progressValue, 0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{pick.remarks || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button disabled={pick.syncStatus !== SyncStatus.Pending} size="sm"
                                className={pick.syncStatus !== SyncStatus.Pending ? "cursor-not-allowed" : "cursor-pointer"}
                                onClick={() => handleUpdatePick?.(pick)}>
                          <RefreshCw className="mr-1 h-3 w-3"/>{t("sync")}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        {user?.settings.enablePickingCheck && (
                          <PickingCheckButton
                            picking={pick}
                            progressValue={progressValue}
                            onStartCheck={handleStartCheck}
                          />
                        )}
                        <Button variant="destructive" size="sm" className="cursor-pointer"
                                onClick={() => handleCancelPick?.(pick)}>
                          <XCircle className="mr-1 h-3 w-3"/>{t("cancel")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="p-4">
          <Alert variant="default" className="bg-blue-100 border-blue-400 text-blue-700">
            <AlertDescription>{t("nodata")}</AlertDescription>
          </Alert>
        </div>
      )}
      <MessageBox
        onConfirm={handleConfirmAction}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        type="confirm"
        title={StringFormat(t("confirmCancelPick"), selectedDocument?.entry)}
        description={t('actionCannotReverse')}
      />
    </ContentTheme>
  );
}
