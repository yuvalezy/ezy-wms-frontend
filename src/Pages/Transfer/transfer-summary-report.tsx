import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router";
import {useAuth, useThemeContext} from "@/components";
import ContentTheme from "@/components/ContentTheme";
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import TransferSummaryReportTable from "@/features/transfer/components/transfer-summary-report-table";
import {transferService} from "@/features/transfer/data/transefer-service";
import {TransferSummaryReportData} from "@/features/transfer/data/transfer";
import {exportToExcel} from "@/utils/excelExport";
import {getExcelQuantityHeaders, getExcelQuantityValues} from "@/utils/excel-quantity-format";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";

export default function TransferSummaryReport() {
  const {id} = useParams<{id: string}>();
  const {loading, setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const {user, getUnitSettings: getUnitSettingsFn} = useAuth();
  const {enableUnitSelection: unitSelection, enableUseBaseUn} = getUnitSettingsFn("Transfer");
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();
  const navigate = useNavigate();

  const [data, setData] = useState<TransferSummaryReportData | null>(null);

  const settings = user!.settings;

  useEffect(() => {
    if (id == null) {
      return;
    }
    loadData();
  }, [id]);

  function loadData() {
    if (id == null) {
      return;
    }
    setLoading(true);
    transferService.fetchTransferSummaryReport(id)
      .then((result) => setData(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  const binCodes = (bins: {code: string}[]) => bins.map((b) => b.code).join(", ");

  const getExcelHeaders = () => {
    const headers = [
      t("code"),
      t("description"),
      t("sourceBins"),
      t("targetBins"),
    ];
    headers.push(...getExcelQuantityHeaders(t, unitSelection, enableUseBaseUn));
    return headers;
  };

  const excelData = () => {
    return data?.lines.map((row) => {
      const values = [
        row.itemCode,
        row.itemName,
        binCodes(row.sourceBins),
        binCodes(row.targetBins),
      ];
      values.push(...getExcelQuantityValues({
        quantity: row.sourceQuantity,
        numInBuy: row.numInBuy,
        purPackUn: row.purPackUn,
      }, unitSelection, enableUseBaseUn));
      return values;
    }) ?? [];
  };

  const handleExportExcel = async () => {
    await exportToExcel({
      name: "TransferData",
      headers: getExcelHeaders,
      getData: excelData,
      fileName: `transfer_data_${data?.number}`
    });
  };

  const headerValue = (label: string, value: React.ReactNode) => (
    <div>
      <span className="text-gray-500">{label}:</span>
      <span className="ml-2 font-medium">{value}</span>
    </div>
  );

  return (
    <ContentTheme title={t("transferSupervisor")}
                  titleOnClick={() => navigate('/transferSupervisor')}
                  titleBreadcrumbs={[{label: `${data?.number ?? t('loading')}`}, {label: t("transferReport")}]}
                  onExportExcel={handleExportExcel}>
      <div className="space-y-4">
        {/* Loading State */}
        {loading && !data && (
          <div className="space-y-4" aria-label="Loading...">
            <Skeleton className="h-32 w-full"/>
            <div className="space-y-3">
              <Skeleton className="h-10 w-full"/>
              {Array.from({length: 8}).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full"/>
              ))}
            </div>
          </div>
        )}

        {/* Data Display */}
        {data && (
          <>
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {data.name && headerValue(t('id'), data.name)}
                  {headerValue(t('docDate'), dateFormat(data.date))}
                  {headerValue(t('status'), documentStatusToString(data.status))}
                  {headerValue(t('sourceWarehouse'), data.whsCode)}
                  {settings.enableWarehouseTransfer && headerValue(t('targetWarehouse'), data.targetWhsCode || '-')}
                  {headerValue(t('createdBy'), data.createdByUserName || '-')}
                  {headerValue(t('sapDocNumber'), data.sapDocNumber ?? '-')}
                  {data.comments && headerValue(t('comment'), data.comments)}
                </div>
              </CardContent>
            </Card>

            <TransferSummaryReportTable data={data.lines} emptyMessage={t('noItemsFound')}/>
          </>
        )}
      </div>
    </ContentTheme>
  );
}
