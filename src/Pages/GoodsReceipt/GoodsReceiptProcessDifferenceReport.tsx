import React from "react";
import ContentTheme from "@/components/ContentTheme";
import {Link, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import GoodsReceiptProcessDifferenceTable from "@/pages/GoodsReceipt/components/GoodsReceiptProcessDifferenceTable";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import InfoBox, {FullInfoBox, InfoBoxValue} from "@/components/InfoBox";
import {
  useGoodsReceiptProcessDifferenceReportData
} from "@/pages/GoodsReceipt/data/goods-receipt-process-difference-report-data";
import {Button, Card, CardContent, CardHeader} from "@/components";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface GoodsReceiptProcessDifferenceReportProps {
  confirm?: boolean
}

export default function GoodsReceiptProcessDifferenceReport({confirm}: GoodsReceiptProcessDifferenceReportProps) {
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

  const title = `${!confirm ? t("goodsReceiptSupervisor") : t("goodsReceiptConfirmationSupervisor")}`;
  const titleLink = `/goodsReceipt${confirm ? 'Confirmation' : ''}Supervisor`;
  const subTitle = !confirm ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit');
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
              <TableHead className="hidden sm:table-cell">{t('supplier')}</TableHead>
              <TableHead>{t('supplierName')}</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((value) => (
              <>
                <TableRow key={value.documentNumber}>
                  <TableCell>{`${o(value.baseType)}: ${value.documentNumber}`}</TableCell>
                  <TableCell>{value.vendor.id}</TableCell>
                  <TableCell className="hidden sm:table-cell">{value.vendor.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setReport(value)}>{t('details')}</Button>
                  </TableCell>
                </TableRow>
                <TableRow className="sm:hidden">
                  <TableCell className="bg-gray-100 border-b-1"
                             colSpan={3}>{t('supplierName')}: {value.vendor.name}</TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      )}
      {report && <>
          <FullInfoBox>
              <InfoBoxValue label={t("supplier")} value={report.vendor.id}/>
              <InfoBoxValue label={t("supplierName")} value={(report.vendor.name)}/>
          </FullInfoBox>
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
