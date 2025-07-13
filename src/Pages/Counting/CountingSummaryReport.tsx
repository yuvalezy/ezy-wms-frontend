import React, {useEffect, useState} from "react";
import {useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";
import CountingSummaryReportTable from "@/features/counting/components/CountingSummaryReportTable";
import {exportToExcel} from "@/utils/excelExport";
import {formatQuantityForExcel} from "@/utils/excel-quantity-format";
import ContentTheme from "@/components/ContentTheme";
import {countingService} from "@/features/counting/data/counting-service";
import {CountingSummaryReportData} from "@/features/counting/data/counting";

export default function CountingSummaryReport() {
  const {scanCode} = useParams();
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
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


  const excelHeaders = [
    t("bin"),
    t("code"),
    t("description"),
    t("packages"),
    t("dozens"),
    t("units"),
  ];

  const excelData = () => {
    return data?.lines.map((item) => {
      const quantities = formatQuantityForExcel({
        quantity: item.quantity,
        numInBuy: item.numInBuy,
        purPackUn: item.purPackUn,
      });
      
      return [
        item.binCode,
        item.itemCode,
        item.itemName,
        quantities.pack,
        quantities.dozen,
        quantities.unit,
      ];
    }) ?? [];
  };

  const handleExportExcel = () => {
    exportToExcel({
      name: "CountingData",
      headers: excelHeaders,
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
        {data?.name && (
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              {t("id")}: {data?.name}
            </h2>
          </div>
        )}
        {data && <CountingSummaryReportTable data={data.lines}/>}
      </div>
    </ContentTheme>
  )
}
