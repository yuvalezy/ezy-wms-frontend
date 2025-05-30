import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {useThemeContext} from "@/components/ThemeContext";
import {fetchGoodsReceiptReportAll, GoodsReceiptAll, updateGoodsReceiptReport} from "@/pages/GoodsReceipt/data/Report";
import {IsNumeric} from "@/assets/Functions";
import {DetailUpdateParameters} from "@/assets/Common";
import {GRPOAllDetailRef} from "@/pages/GoodsReceipt/data/goods-receipt-all-details-data";
import {exportToExcel} from "@/utils/excelExport";

export const useGoodsReceiptAllData = (confirm: boolean | undefined) => {
  const {t} = useTranslation();
  const [id, setID] = useState<number | null>();
  const {scanCode} = useParams();
  const {setLoading, setError} = useThemeContext();
  const [data, setData] = useState<GoodsReceiptAll[] | null>(null);
  const title = `${t("goodsReceiptReport")} #${scanCode}`;
  const detailRef = useRef<GRPOAllDetailRef>();

  useEffect(() => {
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      setID(null);
      return;
    }
    const id = parseInt(scanCode);
    setID(id);

    loadData(id);
  }, []);

  function loadData(loadID?: number) {
    if (loadID == null && id == null) {
      return;
    }
    setData(null);
    setLoading(true);
    const fetchID = loadID ?? id ?? 0
    fetchGoodsReceiptReportAll(fetchID)
      .then((result) => setData(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false))
    ;
  }

  const excelHeaders = [
    t("code"),
    t("description"),
    t("Quantity"),
    t("delivery"),
    t("showroom"),
    t("stock"),
    t("qtyInUn"),
    t("packUn"),
  ];

  const excelData = () => {
    return data?.map((item) => [
      item.itemCode,
      item.itemName,
      item.quantity,
      item.delivery,
      item.showroom,
      item.stock,
      item.numInBuy,
      item.purPackUn,
    ]) ?? [];
  };

  const handleExportExcel = () => {
    exportToExcel({
      name: "GoodsReceiptData",
      headers: excelHeaders,
      getData: excelData,
      fileName: `goods_receipt_data_${id}`
    });
  };

  function openDetails(newData: GoodsReceiptAll) {
    detailRef?.current?.show(newData);
  }

  function onDetailUpdate(data: DetailUpdateParameters) {
    if (id == null) {
      return;
    }
    setLoading(true);
    updateGoodsReceiptReport(data)
      .then(() => loadData())
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }
  return {
    data,
    title,
    id,
    detailRef,
    handleExportExcel,
    openDetails,
    onDetailUpdate,
  }
}