import React, {useEffect, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useThemeContext} from "../../components/ThemeContext";
import {useTranslation} from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {useParams} from "react-router-dom";
import {IsNumeric} from "../../assets/Functions";
import {CountingSummaryReportData, fetchCountingSummaryReport} from "./Data/Report";
import CountingSummaryReportTable from "./components/CountingSummaryReportTable";
import {exportToExcel} from "../../utils/excelExport";

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
