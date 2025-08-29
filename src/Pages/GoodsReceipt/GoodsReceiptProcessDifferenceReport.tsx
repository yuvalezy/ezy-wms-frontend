import React from "react";
import ContentTheme from "@/components/ContentTheme";
import { useNavigate} from "react-router";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import GoodsReceiptProcessDifferenceTable from "@/features/goods-receipt/components/GoodsReceiptProcessDifferenceTable";
import {FullInfoBox, InfoBoxValue} from "@/components/InfoBox";
import {
  useGoodsReceiptProcessDifferenceReportData
} from "@/features/goods-receipt/hooks/useGoodsReceiptProcessDifferenceReportData";
import {Button, useAuth} from "@/components";
import {useThemeContext} from "@/components/ThemeContext";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ProcessType} from "@/features/shared/data";
import {Checkbox} from "@/components/ui/checkbox";
import {Skeleton} from "@/components/ui/skeleton";

interface GoodsReceiptProcessDifferenceReportProps {
  processType?: ProcessType
}

export default function GoodsReceiptProcessDifferenceReport({processType = ProcessType.Regular}: GoodsReceiptProcessDifferenceReportProps) {
  const {t} = useTranslation();
  const {displayVendor} = useAuth();
  const {loading} = useThemeContext();
  const navigate = useNavigate();
  const {
    info,
    o,
    data,
    report,
    setReport,
    handleExportExcel,
    showOnlyDifferences,
    setShowOnlyDifferences,
  } = useGoodsReceiptProcessDifferenceReportData();

  const getTitle = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return t("goodsReceiptConfirmationSupervisor");
      case ProcessType.TransferConfirmation:
        return t("transferConfirmationSupervisor");
      default:
        return t("goodsReceiptSupervisor");
    }
  };

  const getTitleLink = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return '/goodsReceiptConfirmationSupervisor';
      case ProcessType.TransferConfirmation:
        return '/transferConfirmationSupervisor';
      default:
        return '/goodsReceiptSupervisor';
    }
  };

  const getSubTitle = () => {
    return t('differencesReport');
  };

  const title = getTitle();
  const titleLink = getTitleLink();
  const subTitle = getSubTitle();
  const titleBreadcrumbs = [
    {label: `${info?.number?.toString() || t('loading')}`},
    {label: subTitle, onClick: report ? () => setReport(null) : undefined}
  ];

  if (report) {
    titleBreadcrumbs.push({label: `${o(report.baseType)}: ${report.documentNumber}`});
  }

  return (
    <ContentTheme title={title} titleOnClick={() => navigate(titleLink)} titleBreadcrumbs={titleBreadcrumbs}
                  onExportExcel={handleExportExcel}>
      {/* Loading State for Document List */}
      {!report && loading && (
        <Table aria-label="Loading...">
          <TableHeader>
            <TableRow>
              <TableHead>{t('document')}</TableHead>
              {processType !== ProcessType.TransferConfirmation && displayVendor && (
                <>
                  <TableHead className="hidden sm:table-cell">{t('supplier')}</TableHead>
                  <TableHead>{t('supplierName')}</TableHead>
                </>
              )}
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({length: 5}).map((_, index) => (
              <>
                <TableRow key={`skeleton-${index}-doc`}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  {processType !== ProcessType.TransferConfirmation && displayVendor && (
                    <>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 rounded" />
                  </TableCell>
                </TableRow>
                {processType !== ProcessType.TransferConfirmation && displayVendor && (
                  <TableRow className="sm:hidden" key={`skeleton-${index}-vendor`}>
                    <TableCell className="bg-gray-100 border-b-1" colSpan={3}>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Document List */}
      {!report && !loading && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('document')}</TableHead>
              {processType !== ProcessType.TransferConfirmation && displayVendor && (
                <>
                  <TableHead className="hidden sm:table-cell">{t('supplier')}</TableHead>
                  <TableHead>{t('supplierName')}</TableHead>
                </>
              )}
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((value) => (
              <>
                <TableRow key={`${value.documentNumber}-doc`}>
                  <TableCell>{`${o(value.baseType)}: ${value.documentNumber}`}</TableCell>
                  {processType !== ProcessType.TransferConfirmation && displayVendor && (
                    <>
                      <TableCell>{value.vendor.id}</TableCell>
                      <TableCell className="hidden sm:table-cell">{value.vendor.name}</TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setReport(value)}>{t('details')}</Button>
                  </TableCell>
                </TableRow>
                {processType !== ProcessType.TransferConfirmation && displayVendor && (
                  <TableRow className="sm:hidden" key={`${value.documentNumber}-vendor`}>
                    <TableCell className="bg-gray-100 border-b-1"
                               colSpan={3}>{t('supplierName')}: {value.vendor.name}</TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      )}
      {/* Loading State for Report Details */}
      {report && loading && (
        <>
          {processType !== ProcessType.TransferConfirmation && displayVendor && (
            <FullInfoBox>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </FullInfoBox>
          )}
          <div className="flex items-center space-x-2 mb-4 ml-4 md:ml-0">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-4" aria-label="Loading...">
            <Skeleton className="h-8 w-full" />
            {Array.from({length: 6}).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </>
      )}

      {/* Report Details */}
      {report && !loading && (
        <>
          {processType !== ProcessType.TransferConfirmation && displayVendor && (
            <FullInfoBox>
                <InfoBoxValue label={t("supplier")} value={report.vendor.id}/>
                <InfoBoxValue label={t("supplierName")} value={(report.vendor.name)}/>
            </FullInfoBox>
          )}
          <div className="flex items-center space-x-2 mb-4 ml-4 md:ml-0">
            <Checkbox 
              id="showOnlyDifferences" 
              checked={showOnlyDifferences}
              onCheckedChange={(checked) => setShowOnlyDifferences(checked as boolean)}
            />
            <label 
              htmlFor="showOnlyDifferences" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("showOnlyDifferences")}
            </label>
          </div>
          {info && <GoodsReceiptProcessDifferenceTable id={info.id} data={report}/>}
        </>
      )}
      {data && data.length === 0 && (
        <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
          <AlertDescription>{t("nodata")}</AlertDescription>
        </Alert>
      )}
    </ContentTheme>
  );
}
