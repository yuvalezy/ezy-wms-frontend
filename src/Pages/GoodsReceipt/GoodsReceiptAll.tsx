import React, {useEffect, useRef, useState} from "react";
import {formatValueByPack} from "../../Assets/Quantities";
import ContentTheme from "../../Components/ContentTheme";
import {useParams} from "react-router-dom";
import {
  fetchGoodsReceiptReportAll, GoodsReceiptAll, updateGoodsReceiptReport,
} from "./Data/Report";
import GoodsReceiptAllReportTable from "./Components/GoodsReceiptAllTable";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {CheckBox, MessageStrip, Title} from "@ui5/webcomponents-react";
import {IsNumeric} from "../../Assets/Functions";
import {GRPOAllDetailRef} from "./Components/GoodsReceiptAllDetail";
import GoodsReceiptAllDialog from "./Components/GoodsReceiptAllDetail";
import {DetailUpdateParameters} from "../../Assets/Common";
import ExcelExporter from "../../Components/ExcelExporter";

export default function GoodsReceiptReportAll() {
  const {t} = useTranslation();
  const [id, setID] = useState<number | null>();
  const {scanCode} = useParams();
  const {setLoading, setAlert, setError} = useThemeContext();
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
    setAlert(null);
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
    t("purPackUn"),
    t("packUn"),
  ];

  function excelData() {
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
  }

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

  return (
    <ContentTheme title={title} icon="manager-insight">
      <div style={{position: "relative"}}>
        <Title level="H1">
          {t("goodsReceipt")} #{id}
        </Title>
        <ExcelExporter name="GoodsReceiptData" headers={excelHeaders} getData={excelData}
                       fileName={`goods_receipt_data_${id}`}/>
      </div>
      {data && <>
          <GoodsReceiptAllReportTable onClick={openDetails} data={data}/>
        {data.length === 0 && (
          <MessageStrip hideCloseButton design="Warning">{t("noExitData")}</MessageStrip>
        )}
        {id && <GoodsReceiptAllDialog ref={detailRef} id={id} onUpdate={onDetailUpdate}/>}
      </>}
    </ContentTheme>
  );
}
