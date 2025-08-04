import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useThemeContext} from "@/components/ThemeContext";
import {
  GoodsReceiptAll,
  GoodsReceiptAllLine,
} from "@/features/goods-receipt/data/goods-receipt-reports";
import {DetailUpdateParameters} from "@/features/shared/data/shared";
import {ProcessType} from "@/features/shared/data";
import {GRPOAllDetailRef} from "@/features/goods-receipt/hooks/useGoodsReceiptAllDetailsData";
import {exportToExcel} from "@/utils/excelExport";
import {getExcelQuantityHeaders, getExcelQuantityValues} from "@/utils/excel-quantity-format";

import {ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {goodsReceiptService} from "@/features/goods-receipt/data/goods-receipt-service";
import {goodsReceiptReportService} from "@/features/goods-receipt/data/goods-receipt-report-service";
import {useAuth} from "@/components";
import {formatNumber} from "@/utils/number-utils";

export const useGoodsReceiptAllData = (processType: ProcessType = ProcessType.Regular) => {
  const {t} = useTranslation();
  const {unitSelection} = useAuth();
  const {scanCode} = useParams();
  const {setLoading, setError} = useThemeContext();
  const [data, setData] = useState<GoodsReceiptAll | null>(null);
  const [info, setInfo] = useState<ReceiptDocument | null>(null);
  const title = `${t("goodsReceiptReport")} #${scanCode}`;
  const detailRef = useRef<GRPOAllDetailRef>();
  const {user} = useAuth();

  useEffect(() => {
    if (scanCode === null || scanCode === undefined) {
      return;
    }
    loadData();
  }, []);

  function loadData() {
    if (scanCode == null) {
      return;
    }
    goodsReceiptService.fetch(scanCode)
      .then((result) => setInfo(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
    setData(null);
    setLoading(true);
    goodsReceiptReportService.fetchReportAll(scanCode)
      .then((result) => setData(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false))
    ;
  }

  const getExcelHeaders = () => {
    const headers = [
      t("code"),
      t("description"),
    ];
    headers.push(...getExcelQuantityHeaders(t, unitSelection, user?.settings.enableUseBaseUn));
    headers.push(
      t("delivery"),
      t("showroom"),
      t("stock"),
      t("qtyInUn"),
      t("packUn"),
    );
    return headers;
  }

  const excelData = () => {
    return data?.lines?.map((item) => {
      const values = [
        item.itemCode,
        item.itemName,
      ];

      values.push(...getExcelQuantityValues({
        quantity: item.quantity,
        numInBuy: item.numInBuy,
        purPackUn: item.purPackUn,
      }, unitSelection, user?.settings.enableUseBaseUn));
      
      values.push(
        formatNumber(item.delivery, 0),
        formatNumber(item.showroom, 0),
        formatNumber(item.stock, 0),
        formatNumber(item.numInBuy, 0),
        formatNumber(item.purPackUn, 0),
      )
      return values;
    }) ?? [];
  };

  const handleExportExcel = () => {
    exportToExcel({
      name: "GoodsReceiptData",
      headers: getExcelHeaders,
      getData: excelData,
      fileName: `goods_receipt_data_${scanCode}`
    });
  };

  function openDetails(newData: GoodsReceiptAllLine) {
    detailRef?.current?.show(newData);
  }

  function onDetailUpdate(data: DetailUpdateParameters) {
    if (scanCode == null) {
      return;
    }
    setLoading(true);
    goodsReceiptReportService.updateReport(data)
      .then(() => loadData())
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }

  return {
    data,
    title,
    detailRef,
    handleExportExcel,
    openDetails,
    onDetailUpdate,
    info
  }
}