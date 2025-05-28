import React, {useEffect, useRef, useState} from "react";
import {formatValueByPack} from "../../Assets/Quantities";
import ContentTheme from "../../components/ContentTheme";
import {useParams} from "react-router-dom";
import {
  fetchGoodsReceiptReportAll, GoodsReceiptAll, updateGoodsReceiptReport,
} from "./Data/Report";
import GoodsReceiptAllReportTable from "./Components/GoodsReceiptAllTable";
import {useThemeContext} from "../../components/ThemeContext";
import {useTranslation} from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added AlertTitle
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {IsNumeric} from "../../Assets/Functions";
import {GRPOAllDetailRef} from "./Components/GoodsReceiptAllDetail";
import GoodsReceiptAllDialog from "./Components/GoodsReceiptAllDetail";
import {DetailUpdateParameters} from "../../Assets/Common";
import {exportToExcel} from "../../Utils/excelExport";

export default function GoodsReceiptReportAll() {
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
    t("purPackUn"),
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

  return (
    <ContentTheme title={title} exportExcel={true} onExportExcel={handleExportExcel}>
      <Card>
        <CardHeader>
          <CardTitle>{t("goodsReceipt")} #{id}</CardTitle>
        </CardHeader>
        <CardContent>
          {data && <>
            <GoodsReceiptAllReportTable onClick={openDetails} data={data}/>
            {data.length === 0 && (
              <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
                {/* <AlertTitle>{t("warning")}</AlertTitle> */}
                <AlertDescription>{t("noExitData")}</AlertDescription>
              </Alert>
            )}
            {id && <GoodsReceiptAllDialog ref={detailRef} id={id} onUpdate={onDetailUpdate}/>}
          </>}
        </CardContent>
      </Card>
    </ContentTheme>
  );
}
