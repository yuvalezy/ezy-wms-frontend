import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useObjectName} from "@/assets/ObjectName";
import {useThemeContext} from "@/components/ThemeContext";
import {
  fetchGoodsReceiptValidateProcess,
  GoodsReceiptValidateProcess,
  ProcessLineStatus
} from "@/pages/GoodsReceipt/data/Report";
import {IsNumeric} from "@/assets/Functions";
import {exportToExcel} from "@/utils/excelExport";

export const useGoodsReceiptProcessDifferenceReportData = () => {
  const {t} = useTranslation();
  const [id, setID] = useState<number | null>();
  const {scanCode} = useParams();
  const o = useObjectName();
  const {setLoading, setError} = useThemeContext();
  const [data, setData] = useState<GoodsReceiptValidateProcess[] | null>(null);
  const [report, setReport] = useState<GoodsReceiptValidateProcess | null>(null);

  useEffect(() => {
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      setID(null);
      return;
    }
    setID(parseInt(scanCode));

    setLoading(true);
    fetchGoodsReceiptValidateProcess(parseInt(scanCode))
      .then((result) => setData(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const excelHeaders = [
    t("code"),
    t("description"),
    t("Quantity"),
  ];

  function excelData() {
    const itemMap: { [key: string]: (string | number)[] } = {};
    const issueFoundMap: { [key: string]: boolean } = {};

    data?.forEach(value => {
      value.lines.forEach((line) => {
        let itemCode = line.itemCode;
        let quantity = line.quantity;
        if (!itemMap[itemCode]) {
          itemMap[itemCode] = [itemCode, line.itemName, quantity];
        } else {
          itemMap[itemCode][2] = (itemMap[itemCode][2] as number) + quantity;
        }
        if (line.lineStatus !== ProcessLineStatus.OK && line.lineStatus !== ProcessLineStatus.ClosedLine) {
          issueFoundMap[itemCode] = true;
        }
      })
    });

    return Object.values(itemMap).filter((v) => issueFoundMap[v[0]]);
  }

  const handleExportExcel = () => {
    exportToExcel({
      name: "DifferenceReport",
      headers: excelHeaders,
      getData: excelData,
      fileName: `goods_receipt_differences_${id}`
    });
  };

  const openReport = (e: React.MouseEvent<HTMLAnchorElement>, report: GoodsReceiptValidateProcess) => {
    e.preventDefault();
    setReport(report);
  }
  return {
    id,
    scanCode,
    o,
    data,
    report,
    setReport,
    handleExportExcel,
    openReport,
  }
}