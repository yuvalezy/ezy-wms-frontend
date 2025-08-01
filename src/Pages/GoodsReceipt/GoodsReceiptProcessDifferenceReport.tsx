import React from "react";
import ContentTheme from "@/components/ContentTheme";
import {Link, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import GoodsReceiptProcessDifferenceTable from "@/features/goods-receipt/components/GoodsReceiptProcessDifferenceTable";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import InfoBox, {FullInfoBox, InfoBoxValue} from "@/components/InfoBox";
import {
  useGoodsReceiptProcessDifferenceReportData
} from "@/features/goods-receipt/hooks/useGoodsReceiptProcessDifferenceReportData";
import {Button, Card, CardContent, CardHeader} from "@/components";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {ProcessType} from "@/features/shared/data";

interface GoodsReceiptProcessDifferenceReportProps {
  processType?: ProcessType
}

export default function GoodsReceiptProcessDifferenceReport({processType = ProcessType.Regular}: GoodsReceiptProcessDifferenceReportProps) {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {
    info,
    o,
    data,
    report,
    setReport,
    handleExportExcel,
  } = useGoodsReceiptProcessDifferenceReportData();

  if (!info)
    return null;

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
    {label: `${info?.number}`},
    {label: subTitle, onClick: report ? () => setReport(null) : undefined}
  ];

  if (report) {
    titleBreadcrumbs.push({label: `${o(report.baseType)}: ${report.documentNumber}`});
  }

  return (
    <ContentTheme title={title} titleOnClick={() => navigate(titleLink)} titleBreadcrumbs={titleBreadcrumbs}
                  onExportExcel={handleExportExcel}>
      {!report && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('document')}</TableHead>
              {processType !== ProcessType.TransferConfirmation && (
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
                  {processType !== ProcessType.TransferConfirmation && (
                    <>
                      <TableCell>{value.vendor.id}</TableCell>
                      <TableCell className="hidden sm:table-cell">{value.vendor.name}</TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setReport(value)}>{t('details')}</Button>
                  </TableCell>
                </TableRow>
                {processType !== ProcessType.TransferConfirmation && (
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
      {report && <>
          {processType !== ProcessType.TransferConfirmation && (
            <FullInfoBox>
                <InfoBoxValue label={t("supplier")} value={report.vendor.id}/>
                <InfoBoxValue label={t("supplierName")} value={(report.vendor.name)}/>
            </FullInfoBox>
          )}
          <GoodsReceiptProcessDifferenceTable id={info.id} data={report}/>
      </>}
      {data && data.length === 0 && (
        <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
          <AlertDescription>{t("nodata")}</AlertDescription>
        </Alert>
      )}
    </ContentTheme>
  );
}
