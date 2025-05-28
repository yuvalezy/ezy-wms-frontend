import React from "react";
import ContentTheme from "@/components/ContentTheme";
import {Link, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import GoodsReceiptProcessDifferenceTable from "@/pages/GoodsReceipt/components/GoodsReceiptProcessDifferenceTable";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import InfoBox, {InfoBoxValue} from "@/components/InfoBox";
import {
  useGoodsReceiptProcessDifferenceReportData
} from "@/pages/GoodsReceipt/data/goods-receipt-process-difference-report-data";

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

  const title = `${!confirm ? t("goodsReceipt") : t("receiptConfirmation")} #${scanCode}`;

  if (!id)
    return null;

  return (
    <ContentTheme title={title} exportExcel={true} onExportExcel={handleExportExcel}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#"
                            onClick={() => navigate(`/goodsReceipt${confirm ? 'Confirmation' : ''}Supervisor`)}>{t('supervisor')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            {!report ?
              <BreadcrumbPage>{t("differencesReport")}</BreadcrumbPage> :
              <BreadcrumbLink href="#"
                              onClick={() => setReport(null)}>{t("differencesReport")}</BreadcrumbLink>
            }
          </BreadcrumbItem>
          {report && <BreadcrumbItem>
              <BreadcrumbPage>{`${o(report.baseType)}: ${report.documentNumber}`}</BreadcrumbPage>
          </BreadcrumbItem>}
        </BreadcrumbList>
      </Breadcrumb>
      {!report && data?.map((value) => (
        <div key={value.documentNumber} className="mb-2">
          <Link to="#"
                className="flex items-center text-blue-600 hover:text-blue-800"
                onClick={(e) => openReport(e, value)}>
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
            {`${o(value.baseType)}: ${value.documentNumber}`}
          </Link>
        </div>
      ))}
      {report && <>
          <InfoBox>
              <InfoBoxValue label={t("supplier")} value={report.cardCode}/>
              <InfoBoxValue label={t("supplierName")} value={report.cardName}/>
          </InfoBox>
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
