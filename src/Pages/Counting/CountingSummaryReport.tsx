import React, {useEffect, useState} from "react";
import {useAuth, useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";
import CountingSummaryReportTable from "@/features/counting/components/CountingSummaryReportTable";
import {exportToExcel} from "@/utils/excelExport";
import {formatQuantityForExcel, getExcelQuantityHeaders, getExcelQuantityValues} from "@/utils/excel-quantity-format";
import ContentTheme from "@/components/ContentTheme";
import {countingService} from "@/features/counting/data/counting-service";
import {CountingSummaryReportData} from "@/features/counting/data/counting";
import {Skeleton} from "@/components/ui/skeleton";

export default function CountingSummaryReport() {
  const {scanCode} = useParams();
  const {loading, setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const {unitSelection, user} = useAuth();
  const [data, setData] = useState<CountingSummaryReportData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scanCode === null || scanCode === undefined) {
      return;
    }
    setLoading(true);
    countingService.fetchCountingSummaryReport(scanCode)
      .then((result) => setData(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);


  const getExcelHeaders = () => {
    const headers = [
      t("bin"),
      t("code"),
      t("description"),
    ];
    headers.push(...getExcelQuantityHeaders(t, unitSelection, user?.settings.enableUseBaseUn));
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
      }, unitSelection, user?.settings.enableUseBaseUn));
      return values;
    }) ?? [];
  };

  const handleExportExcel = () => {
    exportToExcel({
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
        {loading && !data && (
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
            <CountingSummaryReportTable data={data.lines}/>
          </>
        )}
      </div>
    </ContentTheme>
  )
}
