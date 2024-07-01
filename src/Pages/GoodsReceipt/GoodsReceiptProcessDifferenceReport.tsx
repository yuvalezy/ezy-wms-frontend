import React, { useEffect, useState } from "react";
import ContentTheme from "../../Components/ContentTheme";
import { useParams } from "react-router-dom";
import { fetchGoodsReceiptValidateProcess, GoodsReceiptValidateProcess, } from "./Data/Report";
import { useThemeContext } from "../../Components/ThemeContext";
import { useTranslation } from "react-i18next";
import {Panel, Title, MessageStrip} from "@ui5/webcomponents-react";
import {useObjectName} from "../../Assets/ObjectName";
import {IsNumeric} from "../../Assets/Functions";
import GoodsReceiptProcessDifferenceTable from "./Components/GoodsReceiptProcessDifferenceTable";

export default function GoodsReceiptProcessDifferenceReport() {
    const [id, setID] = useState<number | null>();
    const { scanCode } = useParams();
    const { t } = useTranslation();
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
    return (
        <ContentTheme title={title} icon="manager-insight">
            <Title level="H1">
                {t("goodsReceipt")} #{id}
            </Title>
            <div>
                {id && data?.map((value) => (
                    <Panel
                        collapsed
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
                        <GoodsReceiptProcessDifferenceTable id={id} data={value} />
                    </Panel>
                ))}
            </div>
            {data && data.length === 0 && (
                <MessageStrip hideCloseButton design="Warning">{t("nodata")}</MessageStrip>
            )}
        </ContentTheme>
    );
}
