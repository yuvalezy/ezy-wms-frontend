import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useThemeContext} from "@/components/ThemeContext";
import {
  GoodsReceiptAll,
  GoodsReceiptAllLine,
} from "@/features/goods-receipt/data/goods-receipt-reports";
import {DetailUpdateParameters} from "@/features/shared/data/shared";
import {GRPOAllDetailRef} from "@/features/goods-receipt/hooks/useGoodsReceiptAllDetailsData";
import {exportToExcel} from "@/utils/excelExport";
import {formatQuantityForExcel} from "@/utils/excel-quantity-format";

import {ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {goodsReceiptService} from "@/features/goods-receipt/data/goods-receipt-service";
import {goodsReceiptReportService} from "@/features/goods-receipt/data/goods-receipt-report-service";

export const useGoodsReceiptAllData = (confirm: boolean | undefined) => {
  const {t} = useTranslation();
  const {scanCode} = useParams();
  const {setLoading, setError} = useThemeContext();
  const [data, setData] = useState<GoodsReceiptAll | null>(null);
  const [info, setInfo] = useState<ReceiptDocument | null>(null);
  const title = `${t("goodsReceiptReport")} #${scanCode}`;
  const detailRef = useRef<GRPOAllDetailRef>();

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

  const excelHeaders = [
    t("code"),
    t("description"),
    t("pack"),
    t("dozen"),
    t("unit"),
    t("delivery"),
    t("showroom"),
    t("stock"),
    t("qtyInUn"),
    t("packUn"),
  ];

  const excelData = () => {
    return data?.lines?.map((item) => {
      const quantities = formatQuantityForExcel({
        quantity: item.quantity,
        numInBuy: item.numInBuy,
        buyUnitMsr: item.buyUnitMsr || "",
        purPackUn: item.purPackUn,
        purPackMsr: item.purPackMsr || ""
      });

      return [
        item.itemCode,
        item.itemName,
        quantities.pack,
        quantities.dozen,
        quantities.unit,
        item.delivery,
        item.showroom,
        item.stock,
        item.numInBuy,
        item.purPackUn,
      ];
    }) ?? [];
  };

  const handleExportExcel = () => {
    exportToExcel({
      name: "GoodsReceiptData",
      headers: excelHeaders,
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