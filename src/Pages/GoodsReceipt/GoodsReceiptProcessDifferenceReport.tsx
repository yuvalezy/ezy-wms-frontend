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
    id,
    scanCode,
    o,
    data,
    report,
    setReport,
    handleExportExcel,
    openReport,
  } = useGoodsReceiptProcessDifferenceReportData();

  if (!id)
    return null;

  const title = `${!confirm ? t("goodsReceiptSupervisor") : t("goodsReceiptConfirmationSupervisor")}`;
  const titleLink = `/goodsReceipt${confirm ? 'Confirmation' : ''}Supervisor`;
  const subTitle = !confirm ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit');
  const titleBreadcrumbs = [
    {label: `${scanCode}`},
    {label: subTitle, onClick: report ? () => setReport(null) : undefined}
  ];

  if (report) {
    titleBreadcrumbs.push({label: `${o(report.baseType)}: ${report.documentNumber}`});
  }

  return (
    <ContentTheme title={title} titleOnClick={() => navigate(titleLink)} titleBreadcrumbs={titleBreadcrumbs} onExportExcel={handleExportExcel}>
      {!report && (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {data?.map((value) => (
              <div key={value.documentNumber} className="mb-2">
                <Card className="mb-4 shadow-lg">
                  <CardHeader>
                    {`${o(value.baseType)}: ${value.documentNumber}`}
                  </CardHeader>
                  <CardContent>
                    <FullInfoBox>
                      <InfoBoxValue label={t("supplier")} value={value.cardCode}/>
                      <InfoBoxValue label={t("supplierName")} value={value.cardName}/>
                    </FullInfoBox>
                    <Button className="w-full" type="button" onClick={() => setReport(value)}>{t('details')}</Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {/* Desktop view - Table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('document')}</TableHead>
                  <TableHead>{t('supplier')}</TableHead>
                  <TableHead>{t('supplierName')}</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((value) => (
                  <TableRow key={value.documentNumber}>
                    <TableCell>{`${o(value.baseType)}: ${value.documentNumber}`}</TableCell>
                    <TableCell>{value.cardCode}</TableCell>
                    <TableCell>{value.cardName}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setReport(value)}>{t('details')}</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      {report && <>
          <FullInfoBox>
              <InfoBoxValue label={t("supplier")} value={report.cardCode}/>
              <InfoBoxValue label={t("supplierName")} value={report.cardName}/>
          </FullInfoBox>
          <GoodsReceiptProcessDifferenceTable id={id} data={report}/>
      </>}
      {data && data.length === 0 && (
        <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
          <AlertDescription>{t("nodata")}</AlertDescription>
        </Alert>
      )}
    </ContentTheme>
  );
}
