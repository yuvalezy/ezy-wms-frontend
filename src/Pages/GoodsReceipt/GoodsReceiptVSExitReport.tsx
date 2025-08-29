import React, {useEffect, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {Link, useNavigate, useParams} from "react-router";
import {
  GoodsReceiptVSExitReportData,
} from "@/features/goods-receipt/data/goods-receipt-reports";
import GoodsReceiptVSExitReportTable from "@/features/goods-receipt/components/GoodsReceiptVSExitReportTable";
import GoodsReceiptVSExitReportSkeleton from "@/features/goods-receipt/components/GoodsReceiptVSExitReportSkeleton";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {useObjectName} from "@/hooks/useObjectName";
import {Alert, AlertDescription} from "@/components/ui/alert";
import  {FullInfoBox, InfoBoxValue} from "@/components/InfoBox";
import {Button, Card, CardContent, CardHeader} from "@/components";
import {goodsReceiptReportService} from "@/features/goods-receipt/data/goods-receipt-report-service";
import {ProcessType} from "@/features/shared/data";

interface GoodsReceiptVSExitReportProps {
  processType?: ProcessType
}

export default function GoodsReceiptVSExitReport({processType = ProcessType.Regular}: GoodsReceiptVSExitReportProps) {
  const {scanCode} = useParams();
  const {t} = useTranslation();
  const o = useObjectName();
  const {setError} = useThemeContext();
  const [data, setData] = useState<GoodsReceiptVSExitReportData[] | null>(null);
  const [report, setReport] = useState<GoodsReceiptVSExitReportData | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (scanCode === null || scanCode === undefined) {
      return;
    }
    setIsLoadingReport(true);
    goodsReceiptReportService.fetchVSExitReport(scanCode)
      .then((result) => setData(result))
      .catch((error) => setError(error))
      .finally(() => setIsLoadingReport(false));
  }, [scanCode, setError]);

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
    switch (processType) {
      case ProcessType.Confirmation:
        return t('confirmationReceiptVSExit');
      case ProcessType.TransferConfirmation:
        return t('transferConfirmationVSExit');
      default:
        return t('goodsReceiptVSExit');
    }
  };

  const title = getTitle();
  const titleLink = getTitleLink();
  const subTitle = getSubTitle();
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
      {isLoadingReport ? (
        <GoodsReceiptVSExitReportSkeleton 
          showDetailedView={!!report}
          cardCount={3}
        />
      ) : (
        <>
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
        </>
      )}
    </ContentTheme>
  );
}
