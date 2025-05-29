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
import InfoBox, {FullInfoBox, InfoBoxValue} from "@/components/InfoBox";
import {Button, Card, CardContent, CardHeader} from "@/components";

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

  const title = `${!confirm ? t("goodsReceiptSupervisor") : t("goodsReceiptConfirmationSupervisor")}`;
  const titleLink = `/goodsReceipt${confirm ? 'Confirmation' : ''}Supervisor`;
  const subTitle = !confirm ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit');
  const titleBreadcrumbs = [
    {label: `${scanCode}`},
    {label: subTitle, onClick: report ? () => setReport(null) : undefined}
  ];

  if (report) {
    titleBreadcrumbs.push({label: `${o(report.objectType)}: ${report.number}`});
  }

  return (
    <ContentTheme title={title} titleOnClick={() => navigate(titleLink)}
                  titleBreadcrumbs={titleBreadcrumbs}>
      {!report && data?.map((value, index) => (
        <div key={index} className="mb-2">
          <Card className="mb-4 shadow-lg">
            <CardHeader>
              {`${o(value.objectType)}: ${value.number}`}
            </CardHeader>
            <CardContent>
              <FullInfoBox>
                <InfoBoxValue label={t("customer")} value={value.cardName}/>
                {value.address && <InfoBoxValue label={t("address")} value={value.address}/>}
              </FullInfoBox>
              <Button className="w-full" type="button" onClick={() => setReport(value)}>{t('details')}</Button>
            </CardContent>
          </Card>
        </div>
      ))}
      {report && <>
          <FullInfoBox>
              <InfoBoxValue label={t("customer")} value={report.cardName}/>
            {report.address && <InfoBoxValue label={t("address")} value={report.address}/>}
          </FullInfoBox>
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
