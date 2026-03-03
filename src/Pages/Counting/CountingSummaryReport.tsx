import React, {useEffect, useRef, useState} from "react";
import {useAuth, useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router";
import CountingSummaryReportTable from "@/features/counting/components/CountingSummaryReportTable";
import {exportToExcel} from "@/utils/excelExport";
import {getExcelQuantityHeaders, getExcelQuantityValues} from "@/utils/excel-quantity-format";
import ContentTheme from "@/components/ContentTheme";
import {countingService} from "@/features/counting/data/counting-service";
import {CountingSummaryReportData, CountingSummaryReportLine} from "@/features/counting/data/counting";
import {Skeleton} from "@/components/ui/skeleton";
import {DetailUpdateParameters, Status} from "@/features/shared/data";
import CountingAllDetail from "@/features/counting/components/CountingAllDetail";
import {CountingAllDetailRef} from "@/features/counting/hooks/useCountingAllDetailsData";

export default function CountingSummaryReport() {
  const {scanCode} = useParams();
  const {loading, setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const {user, getUnitSettings: getUnitSettingsFn} = useAuth();
  const {enableUnitSelection: unitSelection, enableUseBaseUn} = getUnitSettingsFn("InventoryCounting");
  const [data, setData] = useState<CountingSummaryReportData | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isRefreshingDetail, setIsRefreshingDetail] = useState(false);
  const navigate = useNavigate();
  const detailRef = useRef<CountingAllDetailRef>(null);

  useEffect(() => {
    if (scanCode === null || scanCode === undefined) {
      return;
    }
    loadData();
  }, []);

  function loadData() {
    if (scanCode == null) {
      return;
    }
    setLoading(true);
    Promise.all([
      countingService.fetchCountingSummaryReport(scanCode),
      countingService.fetch(scanCode)
    ])
      .then(([reportResult, counting]) => {
        setData(reportResult);
        setStatus(counting.status);
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  function openDetails(row: CountingSummaryReportLine) {
    if (scanCode == null) {
      return;
    }
    setIsLoadingDetail(true);

    Promise.all([
      countingService.fetch(scanCode),
      countingService.fetchReportAllDetails(scanCode, row.itemCode, row.binEntry)
    ])
      .then(([doc, details]) => {
        const enableUpdate = doc.status === Status.Open || doc.status === Status.InProgress;
        detailRef?.current?.show(row, details, enableUpdate);
      })
      .catch((error) => setError(error))
      .finally(() => setIsLoadingDetail(false));
  }

  function onDetailUpdate(updateData: DetailUpdateParameters) {
    if (scanCode == null) {
      return;
    }
    setIsRefreshingDetail(true);
    countingService.updateAll(updateData)
      .then(() => loadData())
      .catch((error) => {
        setError(error);
        setIsRefreshingDetail(false);
      })
      .finally(() => setIsRefreshingDetail(false));
  }

  const getExcelHeaders = () => {
    const headers = [
      t("bin"),
      t("code"),
      t("description"),
    ];
    headers.push(...getExcelQuantityHeaders(t, unitSelection, enableUseBaseUn));
    return headers;
  }

  const excelData = () => {
    return data?.lines.map((item) => {
      const values = [
        item.binCode,
        item.itemCode,
        item.itemName,
      ];
      values.push(...getExcelQuantityValues({
        quantity: item.quantity,
        numInBuy: item.numInBuy,
        purPackUn: item.purPackUn,
      }, unitSelection, enableUseBaseUn));
      return values;
    }) ?? [];
  };

  const handleExportExcel = async () => {
    await exportToExcel({
      name: "CountingData",
      headers: getExcelHeaders,
      getData: excelData,
      fileName: `counting_data_${data?.number}`
    });
  };

  return (
    <ContentTheme title={t("countingSupervisor")}
                  titleOnClick={() => navigate('/countingSupervisor')}
                  titleBreadcrumbs={[{label: `${data?.number}`}, {label: t("countingSummaryReport")}]}
                  onExportExcel={handleExportExcel}>
      <div className="space-y-4">
        {/* Loading State */}
        {(loading || isLoadingDetail || isRefreshingDetail) && !data && (
          <div className="space-y-4" aria-label="Loading...">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              {Array.from({length: 8}).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          </div>
        )}

        {/* Data Display */}
        {data && (
          <>
            {data?.name && (
              <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-semibold text-muted-foreground">
                  {t("id")}: {data?.name}
                </h2>
              </div>
            )}
            <CountingSummaryReportTable
              data={data.lines}
              onClick={openDetails}
              status={status ?? undefined}
            />
          </>
        )}
      </div>

      {scanCode && (
        <CountingAllDetail
          ref={detailRef}
          id={scanCode}
          onUpdate={onDetailUpdate}
        />
      )}
    </ContentTheme>
  )
}
