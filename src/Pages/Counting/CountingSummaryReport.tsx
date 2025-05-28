import React, {useEffect, useState} from "react";
import {useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import {useParams} from "react-router-dom";
import {IsNumeric} from "@/assets";
import {CountingSummaryReportData, fetchCountingSummaryReport} from "@/pages/Counting/data/Report";
import CountingSummaryReportTable from "@/pages/Counting/components/CountingSummaryReportTable";
import {exportToExcel} from "@/utils/excelExport";
import ContentTheme from "@/components/ContentTheme";

export default function CountingSummaryReport() {
  const [id, setID] = useState<number | null>();
  const {scanCode} = useParams();
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const [data, setData] = useState<CountingSummaryReportData | null>(null);
  useEffect(() => {
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      setID(null);
      return;
    }
    let number = parseInt(scanCode);
    setID(number);

    setLoading(true);
    fetchCountingSummaryReport(number)
      .then((result) => setData(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const excelHeaders = [
    t("bin"),
    t("code"),
    t("description"),
    t("units"),
    t("dozens"),
    t("packs")
  ];

  const excelData = () => {
    return data?.lines.map((item) => [
      item.binCode,
      item.itemCode,
      item.itemName,
      item.unit,
      item.dozen,
      item.pack
    ]) ?? [];
  };

  const handleExportExcel = () => {
    exportToExcel({
      name: "CountingData",
      headers: excelHeaders,
      getData: excelData,
      fileName: `counting_data_${id}`
    });
  };

  return (
    <ContentTheme title={t("countingSummaryReport")} exportExcel={true} onExportExcel={handleExportExcel}>
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("counting")} #{id}
          </h1>
          {data?.name && (
            <h2 className="text-2xl font-semibold text-muted-foreground">
              {t("id")} {data?.name}
            </h2>
          )}
        </div>
        {data && <CountingSummaryReportTable data={data.lines}/>}
      </div>
    </ContentTheme>
  )
}
