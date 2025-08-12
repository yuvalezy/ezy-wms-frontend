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
  const [showOnlyDifferences, setShowOnlyDifferences] = useState<boolean>(false);

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
    t("document"),
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
        document: string,
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
      const objectName = o(value.baseType);
      const documentNumber = value.documentNumber;
      const documentDisplay = `${objectName} ${documentNumber}`;
      
      value.lines.forEach((line) => {
        const itemCode = line.itemCode;
        const quantity = line.quantity;
        const documentQuantity = line.documentQuantity;
        const mapKey = `${value.baseType}_${documentNumber}_${itemCode}`;
        
        if (!itemMap[mapKey]) {
          itemMap[mapKey] = {
            document: documentDisplay,
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
          itemMap[mapKey].quantity += quantity;
          itemMap[mapKey].documentQuantity += documentQuantity;
        }
        if (line.lineStatus !== ProcessLineStatus.OK && line.lineStatus !== ProcessLineStatus.ClosedLine) {
          issueFoundMap[mapKey] = true;
        }
      })
    });

    return Object.entries(itemMap)
      .filter(([key, item]) => {
        if (!issueFoundMap[key]) return false;
        if (showOnlyDifferences) {
          return item.quantity !== item.documentQuantity;
        }
        return true;
      })
      .sort(([keyA, itemA], [keyB, itemB]) => {
        // Sort by document first, then by item code
        if (itemA.document !== itemB.document) {
          return itemA.document.localeCompare(itemB.document);
        }
        return itemA.itemCode.localeCompare(itemB.itemCode);
      })
      .map(([key, item]) => {
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
          item.document,
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

  const getFilteredReport = () => {
    if (!report || !showOnlyDifferences) {
      return report;
    }
    
    return {
      ...report,
      lines: report.lines.filter(line => line.quantity !== line.documentQuantity)
    };
  };

  return {
    info,
    scanCode,
    o,
    data,
    report: getFilteredReport(),
    setReport,
    handleExportExcel,
    openReport,
    showOnlyDifferences,
    setShowOnlyDifferences,
  }
}