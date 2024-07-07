import React, {useEffect, useState} from "react";
import ContentTheme from "../../Components/ContentTheme";
import {useParams} from "react-router-dom";
import {
    fetchGoodsReceiptValidateProcess,
    GoodsReceiptValidateProcess,
    ProcessLineStatus,
} from "./Data/Report";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {MessageStrip, Panel, Title} from "@ui5/webcomponents-react";
import {useObjectName} from "../../Assets/ObjectName";
import {IsNumeric} from "../../Assets/Functions";
import GoodsReceiptProcessDifferenceTable from "./Components/GoodsReceiptProcessDifferenceTable";
import ExcelExporter from "../../Components/ExcelExporter";

export default function GoodsReceiptProcessDifferenceReport() {
    const [id, setID] = useState<number | null>();
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const o = useObjectName();
    const {setLoading, setError} = useThemeContext();
    const [data, setData] = useState<GoodsReceiptValidateProcess[] | null>(null);
    const title = `${t("goodsReceipt")} - ${t("differencesReport")} #${scanCode}`;

    useEffect(() => {
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        setID(parseInt(scanCode));

        setLoading(true);
        fetchGoodsReceiptValidateProcess(parseInt(scanCode))
            .then((result) => setData(result))
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }, []);

    const excelHeaders = [
        t("code"),
        t("description"),
        t("Quantity"),
    ];

    function excelData() {
        const itemMap: { [key: string]: (string | number)[] } = {};
        const issueFoundMap: { [key: string]: boolean } = {};

        data?.forEach(value => {
            value.lines.forEach((line) => {
                let itemCode = line.itemCode;
                if (!itemMap[itemCode]) {
                    itemMap[itemCode] = [itemCode, line.itemName, line.quantity];
                } else {
                    itemMap[itemCode][2] = (itemMap[itemCode][2] as number) + line.quantity;
                }
                if (line.lineStatus !== ProcessLineStatus.OK && line.lineStatus !== ProcessLineStatus.ClosedLine) {
                    issueFoundMap[itemCode] = true;
                }
            })
        });

        return Object.values(itemMap).filter((v) => issueFoundMap[v[0]]);
    }

    return (
        <ContentTheme title={title} icon="manager-insight">
            <Title level="H1">
                {t("goodsReceipt")} #{id}
            </Title>
            <ExcelExporter name="DifferenceReport" headers={excelHeaders} getData={excelData}
                           fileName={`goods_receipt_differences_${id}`}/>
            <div>
                {id && data?.map((value) => (
                    <Panel
                        className="break-before"
                        headerText={`${o(value.baseType)}: ${value.documentNumber}`}
                    >
                        <Title level="H3">
                            <strong>{t("supplier")}: </strong>
                            {value.cardCode}
                        </Title>
                        <Title>
                            <strong>{t("supplierName")}: </strong>
                            {value.cardName}
                        </Title>
                        <GoodsReceiptProcessDifferenceTable id={id} data={value}/>
                    </Panel>
                ))}
            </div>
            {data && <>
                {data.length === 0 && (<MessageStrip hideCloseButton design="Warning">{t("nodata")}</MessageStrip>)}
            </>}
        </ContentTheme>
    );
}
