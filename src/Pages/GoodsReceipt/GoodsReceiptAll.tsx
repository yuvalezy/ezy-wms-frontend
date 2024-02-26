import React, {useEffect, useRef, useState} from "react";
import ContentTheme from "../../Components/ContentTheme";
import {useParams} from "react-router-dom";
import {
    fetchGoodsReceiptReportAll, GoodsReceiptAll, updateGoodsReceiptReport,
} from "./Data/Report";
import GoodsReceiptAllReportTable from "./Components/GoodsReceiptAllTable";
import {useThemeContext} from "../../Components/ThemeContext";
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";
import {useTranslation} from "react-i18next";
import {MessageStrip, MessageStripDesign, Title} from "@ui5/webcomponents-react";
import {IsNumeric} from "../../Assets/Functions";
import {GRPOAllDetailRef} from "./Components/GoodsReceiptAllDetail";
import GoodsReceiptAllDialog from "./Components/GoodsReceiptAllDetail";
import {DetailUpdateParameters} from "../../Assets/Common";

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
        const excelBuffer = XLSX.write(wb, {bookType: "xlsx", type: "array"});
        const excelData = new Blob([excelBuffer], {type: ".xlsx"});
        saveAs(excelData, `goods_receipt_data_${id}.xlsx`);
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
        <ContentTheme title={title} icon="manager-insight">
            <div style={{position: "relative"}}>
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
            {data && <>
                <GoodsReceiptAllReportTable onClick={openDetails} data={data}></GoodsReceiptAllReportTable>
                {data.length === 0 && (
                    <MessageStrip hideCloseButton design="Warning">{t("noExitData")}</MessageStrip>
                )}
                {id && <GoodsReceiptAllDialog ref={detailRef} id={id} onUpdate={onDetailUpdate}/>}
            </>}
        </ContentTheme>
    );
}
