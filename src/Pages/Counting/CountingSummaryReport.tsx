import React, {useEffect, useState} from "react";
import ContentTheme from "../../Components/ContentTheme";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Title} from "@ui5/webcomponents-react";
import {useParams} from "react-router-dom";
import {IsNumeric} from "../../Assets/Functions";
import {CountingSummaryReportData, fetchCountingSummaryReport} from "./Data/Report";
import CountingSummaryReportTable from "./Components/CountingSummaryReportTable";
import * as XLSX from "xlsx";
import {saveAs} from "file-saver";

export default function CountingSummaryReport() {
    const [id, setID] = useState<number | null>();
    const { scanCode } = useParams();
    const {setLoading, setError} = useThemeContext();
    const {t} = useTranslation();
    const [data, setData] = useState<CountingSummaryReportData | null>(null);
    useEffect(() => {
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        let number = parseInt(scanCode);
        setID(number);

        setLoading(true);
        fetchCountingSummaryReport(number)
            .then((result) => setData(result))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, []);

    const exportToExcel = () => {
        if (data == null) {
            return;
        }

        const wb = XLSX.utils.book_new();
        const headers = [
            t("bin"),
            t("code"),
            t("description"),
            t("quantity")
        ];
        const dataRows = data.lines.map((item) => [
            item.binCode,
            item.itemCode,
            item.itemName,
            item.quantity
        ]);

        const wsData = [headers, ...dataRows];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "CountingData");

        // Generate a Blob containing the Excel file
        const excelBuffer = XLSX.write(wb, {bookType: "xlsx", type: "array"});
        const excelData = new Blob([excelBuffer], {type: ".xlsx"});
        saveAs(excelData, `counting_data_${id}.xlsx`);
    };

    return (
        <ContentTheme title={t("countingSummaryReport")} icon="manager-insight">
            <Title level="H1">
                {t("counting")} #{id}
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
            <Title level="H2">
                {t("id")} {data?.name}
            </Title>
            {data && <CountingSummaryReportTable data={data.lines}></CountingSummaryReportTable>}
        </ContentTheme>
    )
}