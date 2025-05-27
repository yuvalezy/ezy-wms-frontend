import React, {useEffect, useState} from "react";
import ContentTheme from "../../Components/ContentTheme";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Title} from "@ui5/webcomponents-react";
import {useParams} from "react-router-dom";
import {IsNumeric} from "../../Assets/Functions";
import {CountingSummaryReportData, fetchCountingSummaryReport} from "./Data/Report";
import CountingSummaryReportTable from "./Components/CountingSummaryReportTable";
import {exportToExcel} from "../../Utils/excelExport";

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

    const excelHeaders = [
        t("bin"),
        t("code"),
        t("description"),
        t("units"),
        t("dozens"),
        t("packs")
    ];

    const excelData = () => {
        return data?.lines.map((item) => [
            item.binCode,
            item.itemCode,
            item.itemName,
            item.unit,
            item.dozen,
            item.pack
        ])??[];
    };

    const handleExportExcel = () => {
        exportToExcel({
            name: "CountingData",
            headers: excelHeaders,
            getData: excelData,
            fileName: `counting_data_${id}`
        });
    };

    return (
        <ContentTheme title={t("countingSummaryReport")} exportExcel={true} onExportExcel={handleExportExcel}>
            <Title level="H1">
                {t("counting")} #{id}
            </Title>
            <Title level="H2">
                {t("id")} {data?.name}
            </Title>
            {data && <CountingSummaryReportTable data={data.lines}></CountingSummaryReportTable>}
        </ContentTheme>
    )
}
