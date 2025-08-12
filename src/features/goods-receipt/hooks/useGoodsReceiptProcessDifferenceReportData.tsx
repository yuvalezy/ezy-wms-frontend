import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useObjectName} from "@/hooks/useObjectName";
import {useThemeContext} from "@/components/ThemeContext";
import {useAuth} from "@/components";
import {
  GoodsReceiptValidateProcess,
  ProcessLineStatus
} from "@/features/goods-receipt/data/goods-receipt-reports";
import {exportToExcel} from "@/utils/excelExport";
import {formatQuantityForExcel, getExcelQuantityHeaders, getExcelQuantityValuesFromResult} from "@/utils/excel-quantity-format";
import {ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {goodsReceiptService} from "@/features/goods-receipt/data/goods-receipt-service";
import {goodsReceiptReportService} from "@/features/goods-receipt/data/goods-receipt-report-service";

export const useGoodsReceiptProcessDifferenceReportData = () => {
  const {t} = useTranslation();
  const {scanCode} = useParams();
  const o = useObjectName();
  const {setLoading, setError} = useThemeContext();
  const {user} = useAuth();
  const [data, setData] = useState<GoodsReceiptValidateProcess[] | null>(null);
  const [report, setReport] = useState<GoodsReceiptValidateProcess | null>(null);
  const [info, setInfo] = useState<ReceiptDocument | null>(null);

  useEffect(() => {
    if (scanCode === null || scanCode === undefined) {
      return;
    }

    goodsReceiptService.fetch(scanCode)
      .then((result) => setInfo(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
    setLoading(true);
    goodsReceiptReportService.fetchValidateProcess(scanCode)
      .then((result) => setData(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const excelHeaders = [
    t("code"),
    t("description"),
    t("scannedQuantity"),
    ...getExcelQuantityHeaders(t, true, user?.settings.enableUseBaseUn),
    t("documentQuantity"),
    ...getExcelQuantityHeaders(t, true, user?.settings.enableUseBaseUn),
    t("difference"),
    ...getExcelQuantityHeaders(t, true, user?.settings.enableUseBaseUn),
  ];

  function excelData() {
    const itemMap: {
      [key: string]: {
        itemCode: string,
        itemName: string,
        quantity: number,
        documentQuantity: number,
        numInBuy: number,
        buyUnitMsr: string,
        purPackUn: number,
        purPackMsr: string
      }
    } = {};
    const issueFoundMap: { [key: string]: boolean } = {};

    data?.forEach(value => {
      value.lines.forEach((line) => {
        let itemCode = line.itemCode;
        let quantity = line.quantity;
        let documentQuantity = line.documentQuantity;
        if (!itemMap[itemCode]) {
          itemMap[itemCode] = {
            itemCode: itemCode,
            itemName: line.itemName,
            quantity: quantity,
            documentQuantity: documentQuantity,
            numInBuy: line.numInBuy,
            buyUnitMsr: line.buyUnitMsr ?? t('dozen'),
            purPackUn: line.purPackUn,
            purPackMsr: line.purPackMsr ?? t('pack')
          };
        } else {
          itemMap[itemCode].quantity += quantity;
          itemMap[itemCode].documentQuantity += documentQuantity;
        }
        if (line.lineStatus !== ProcessLineStatus.OK && line.lineStatus !== ProcessLineStatus.ClosedLine) {
          issueFoundMap[itemCode] = true;
        }
      })
    });

    return Object.values(itemMap)
      .filter((item) => issueFoundMap[item.itemCode])
      .map((item) => {
        const quantities = formatQuantityForExcel({
          quantity: item.quantity,
          numInBuy: item.numInBuy,
          purPackUn: item.purPackUn,
        });
        const documentQuantities = formatQuantityForExcel({
          quantity: item.documentQuantity,
          numInBuy: item.numInBuy,
          purPackUn: item.purPackUn,
        });
        const differenceQuantities = formatQuantityForExcel({
          quantity: item.quantity - item.documentQuantity,
          numInBuy: item.numInBuy,
          purPackUn: item.purPackUn,
        });

        return [
          item.itemCode,
          item.itemName,
          "",
          ...getExcelQuantityValuesFromResult(quantities, user?.settings.enableUseBaseUn),
          "",
          ...getExcelQuantityValuesFromResult(documentQuantities, user?.settings.enableUseBaseUn),
          "",
          ...getExcelQuantityValuesFromResult(differenceQuantities, user?.settings.enableUseBaseUn),
        ];
      });
  }

  const handleExportExcel = () => {
    exportToExcel({
      name: "DifferenceReport",
      headers: excelHeaders,
      getData: excelData,
      fileName: `goods_receipt_differences_${info?.number}`
    });
  };

  const openReport = (e: React.MouseEvent<HTMLAnchorElement>, report: GoodsReceiptValidateProcess) => {
    e.preventDefault();
    setReport(report);
  }
  return {
    info,
    scanCode,
    o,
    data,
    report,
    setReport,
    handleExportExcel,
    openReport,
  }
}