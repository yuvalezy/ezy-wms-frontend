import React, {useEffect, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {Link, useNavigate, useParams} from "react-router-dom";
import {
  fetchGoodsReceiptVSExitReport,
  GoodsReceiptVSExitReportData,
} from "@/pages/GoodsReceipt/data/Report";
import GoodsReceiptVSExitReportTable from "@/pages/GoodsReceipt/components/GoodsReceiptVSExitReportTable";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {useObjectName} from "@/assets/ObjectName";
import {IsNumeric} from "@/assets/Functions";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import InfoBox, {InfoBoxValue} from "@/components/InfoBox";

interface GoodsReceiptVSExitReportProps {
  confirm?: boolean
}

export default function GoodsReceiptVSExitReport({confirm}: GoodsReceiptVSExitReportProps) {
  const {scanCode} = useParams();
  const {t} = useTranslation();
  const o = useObjectName();
  const {setLoading, setError} = useThemeContext();
  const [data, setData] = useState<GoodsReceiptVSExitReportData[] | null>(null);
  const [report, setReport] = useState<GoodsReceiptVSExitReportData | null>(null);
  const title = `${!confirm ? t("goodsReceipt") : t("receiptConfirmation")} #${scanCode}`;
  const navigate = useNavigate();

  useEffect(() => {
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      return;
    }
    setLoading(true);
    fetchGoodsReceiptVSExitReport(parseInt(scanCode))
      .then((result) => setData(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const openReport = (e: React.MouseEvent<HTMLAnchorElement>, value: GoodsReceiptVSExitReportData) => {
    e.preventDefault();
    setReport(value);
  }
  return (
    <ContentTheme title={title}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#"
                            onClick={() => navigate(`/goodsReceipt${confirm ? 'Confirmation' : ''}Supervisor`)}>{t('supervisor')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            {!report ?
              <BreadcrumbPage>{!confirm ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit')}</BreadcrumbPage> :
              <BreadcrumbLink href="#"
                              onClick={() => setReport(null)}>{!confirm ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit')}</BreadcrumbLink>
            }

          </BreadcrumbItem>
          {report && <BreadcrumbItem>
              <BreadcrumbPage>{`${o(report.objectType)}: ${report.number}`}</BreadcrumbPage>
          </BreadcrumbItem>}
        </BreadcrumbList>
      </Breadcrumb>
      {!report && data?.map((value, index) => (
        <div key={index} className="mb-2">
          <Link to="#"
                className="flex items-center text-blue-600 hover:text-blue-800"
                onClick={(e) => openReport(e, value)}>
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
            {`${o(value.objectType)}: ${value.number}`}
          </Link>
        </div>
      ))}
      {report && <>
          <InfoBox>
              <InfoBoxValue label={t("customer")} value={report.cardName}/>
            {report.address && <InfoBoxValue label={t("address")} value={report.address}/>}
          </InfoBox>
          <GoodsReceiptVSExitReportTable data={report.lines}/>
      </>}
      {data && data.length === 0 && (
        <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
          {/* <AlertTitle>{t("warning")}</AlertTitle> */}
          <AlertDescription>{t("noExitData")}</AlertDescription>
        </Alert>
      )}
    </ContentTheme>
  );
}
