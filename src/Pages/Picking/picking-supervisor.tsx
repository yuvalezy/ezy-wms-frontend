import ContentTheme from "@/components/ContentTheme";
import {useTranslation} from "react-i18next";
import React, {useEffect, useMemo, useState} from "react";
import {useThemeContext} from "@/components/ThemeContext";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {StringFormat} from "@/utils/string-utils";
import {toast} from "sonner";
import PickingCard from "@/features/picking/components/picking-card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {CheckCircle, Eye, RefreshCw, Search, X, XCircle} from "lucide-react";
import {useNavigate} from "react-router";
import {useAuth} from "@/components/AppContext";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {MessageBox} from "@/components";
import {Skeleton} from "@/components/ui/skeleton";
import {Input} from "@/components/ui/input";
import {useDebounce} from "@/hooks/useDebounce";

import {PickingDocument, SyncStatus} from "@/features/picking/data/picking";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {formatNumber} from "@/utils/number-utils";
import {pickingService} from "@/features/picking/data/picking-service";
import {PickingCheckButton} from "@/features/picking/components/picking-check-button";

export default function PickingSupervisor() {
  const {t} = useTranslation();
  const [pickings, setPickings] = useState<PickingDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const {setLoading, setError} = useThemeContext();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PickingDocument | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  function handleOpen(id: number) {
    navigate(`/pick/${id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.PICKING);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setIsLoading(true);
    pickingService.fetchPickings({displayCompleted: true})
      .then(values => setPickings(values))
      .catch((error) => setError(error))
      .finally(() => {
        setLoading(false);
        setIsLoading(false);
      });
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

  // Memoized filtered pickings based on search term
  const filteredPickings = useMemo(() => {
    if (!debouncedSearchTerm) {
      return pickings;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return pickings.filter((pick) => {
      return (
        pick.entry.toString().includes(searchLower) ||
        pick.salesOrders?.toLowerCase().includes(searchLower) ||
        pick.invoices?.toLowerCase().includes(searchLower) ||
        pick.transfers?.toLowerCase().includes(searchLower) ||
        pick.remarks?.toLowerCase().includes(searchLower)
      );
    });
  }, [pickings, debouncedSearchTerm]);

  // Memoized conditional display flags
  const displaySalesOrders = useMemo(() =>
    filteredPickings.find(picking => picking.salesOrders != null && picking.salesOrders != '') != null,
    [filteredPickings]
  );
  const displayInvoices = useMemo(() =>
    filteredPickings.find(picking => picking.invoices != null && picking.invoices != '') != null,
    [filteredPickings]
  );
  const displayTransfers = useMemo(() =>
    filteredPickings.find(picking => picking.transfers != null && picking.transfers != '') != null,
    [filteredPickings]
  );

  // Skeleton components
  const SupervisorMobileCardSkeleton = () => (
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
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );

  const SupervisorTableSkeleton = () => (
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
          <TableHead></TableHead>
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
            <TableCell className="text-right">
              <div className="flex justify-end gap-2 flex-wrap">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <ContentTheme title={t("pickSupervisor")}>
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t("searchPickings")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <>
          {/* Mobile view - Card skeletons */}
          <div className="block sm:hidden">
            {Array.from({ length: 3 }).map((_, index) => (
              <SupervisorMobileCardSkeleton key={index} />
            ))}
          </div>

          {/* Desktop view - Table skeleton */}
          <div className="hidden sm:block">
            <SupervisorTableSkeleton />
          </div>
        </>
      ) : filteredPickings.length > 0 ? (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {filteredPickings.map((pick) => (
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
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPickings.map((pick) => {
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
                        <div className="flex justify-end gap-2 flex-wrap">
                          {user?.binLocations ?
                            (<Button disabled={pick.syncStatus !== SyncStatus.Pending} size="sm"
                                     className={pick.syncStatus !== SyncStatus.Pending ? "cursor-not-allowed" : "cursor-pointer"}
                                     onClick={() => handleUpdatePick?.(pick)}>
                              <RefreshCw className="mr-1 h-3 w-3"/>{t("sync")}
                            </Button>) :
                            (<Button disabled={pick.syncStatus === SyncStatus.Synced} size="sm"
                                     className={pick.syncStatus === SyncStatus.Synced ? "cursor-not-allowed" : "cursor-pointer"}
                                     onClick={() => handleUpdatePick?.(pick)}>
                              <CheckCircle className="mr-1 h-3 w-3"/>{t("finish")}
                            </Button>)
                          }

                          {user?.settings.enablePickingCheck && (
                            <PickingCheckButton
                              picking={pick}
                              progressValue={progressValue}
                              onStartCheck={handleStartCheck}
                              showViewButton={false}
                            />
                          )}
                          {user?.settings.enablePickingCheck && pick.hasCheck && !pick.checkStarted && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/pick/${pick.entry}/check`)}
                            >
                              <Eye className="mr-2 h-4 w-4"/>
                              {t("viewCheck")}
                            </Button>
                          )}
                          <Button variant="destructive" size="sm" className="cursor-pointer"
                                  onClick={() => handleCancelPick?.(pick)}>
                            <XCircle className="mr-1 h-3 w-3"/>{t("cancel")}
                          </Button>
                        </div>
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
            <AlertDescription>
              {pickings.length === 0 ? t("nodata") : t("noSearchResults")}
            </AlertDescription>
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
