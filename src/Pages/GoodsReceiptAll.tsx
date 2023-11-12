import React, { useEffect, useState } from "react";
import ContentTheme from "../Components/ContentTheme";
import { IsNumeric } from "@Assets/Functions";
import { useParams } from "react-router-dom";
import {
  fetchGoodsReceiptReportAll,
  GoodsReceiptAll,
} from "./GoodsReceiptSupervisor/Report";
import GoodsReceiptAllReportTable from "./GoodsReceiptSupervisor/GoodsReceiptAllTable";
import { useThemeContext } from "../Components/ThemeContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";
import {MessageStrip, MessageStripDesign, Title} from "@ui5/webcomponents-react";

export default function GoodsReceiptReportAll() {
  const { t } = useTranslation();
  const [id, setID] = useState<number | null>();
  const { scanCode } = useParams();
  const { setLoading, setAlert } = useThemeContext();
  const [data, setData] = useState<GoodsReceiptAll[] | null>(null);
  const title = `${t("goodsReceiptVSExit")} #${scanCode}`;

  useEffect(() => {
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      setID(null);
      return;
    }
    setID(parseInt(scanCode));

    setLoading(true);
    fetchGoodsReceiptReportAll(parseInt(scanCode))
      .then((result) => setData(result))
      .catch((error) => setAlert({message: `Loading Error: ${error}`, type: MessageStripDesign.Negative}))
      .finally(() => setLoading(false));
  }, []);

  const exportToExcel = () => {
    if (data == null) {
      return;
    }

    const wb = XLSX.utils.book_new();
    const headers = [
      t("code"),
      t("description"),
      t("Quantity"),
      t("delivery"),
      t("showroom"),
      t("stock"),
    ];
    const dataRows = data.map((item) => [
      item.itemCode,
      item.itemName,
      item.quantity,
      item.delivery,
      item.showroom,
      item.stock,
    ]);

    const wsData = [headers, ...dataRows];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "GoodsReceiptData");

    // Generate a Blob containing the Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const excelData = new Blob([excelBuffer], { type: ".xlsx" });
    saveAs(excelData, `goods_receipt_data_${id}.xlsx`);
  };
  return (
    <ContentTheme title={title} icon="manager-insight">
      <div style={{ position: "relative" }}>
        <Title level="H1">
          {t("goodsReceipt")} #{id}
        </Title>
        <img
          src="/images/excel.jpg"
          alt=""
          onClick={() => exportToExcel()}
          style={{
            height: "32px",
            position: "absolute",
            right: "10px",
            top: "8px",
            cursor: "pointer",
            zIndex: "1000",
          }}
        />
      </div>
      {data && (
        <GoodsReceiptAllReportTable data={data}></GoodsReceiptAllReportTable>
      )}
      {data && data.length === 0 && (
        <MessageStrip hideCloseButton design="Warning">{t("noExitData")}</MessageStrip>
      )}
    </ContentTheme>
  );
}
