import React, { useEffect, useState } from "react";
import ContentTheme from "../Components/ContentTheme";
import { IsNumeric } from "../assets/Functions";
import { useParams } from "react-router-dom";
import {
  fetchGoodsReceiptVSExitReport,
  GoodsReceiptVSExitReportData,
} from "./GoodsReceiptSupervisor/Report";
import GoodsReceiptVSExitReportTable from "./GoodsReceiptSupervisor/GoodsReceiptVSExitReportTable";
import { useThemeContext } from "../Components/ThemeContext";
import { useTranslation } from "react-i18next";
import { useObjectName } from "../assets/ObjectName";
import {Panel, Title, Text, MessageStrip, MessageStripDesign} from "@ui5/webcomponents-react";

export default function GoodsReceiptVSExitReport() {
  const [id, setID] = useState<number | null>();
  const { scanCode } = useParams();
  const { t } = useTranslation();
  const o = useObjectName();
  const {setLoading, setAlert} = useThemeContext();
  const [data, setData] = useState<GoodsReceiptVSExitReportData[] | null>(null);
  const title = `${t("goodsReceiptVSExit")} #${scanCode}`;

  useEffect(() => {
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      setID(null);
      return;
    }
    setID(parseInt(scanCode));

    setLoading(true);
    fetchGoodsReceiptVSExitReport(parseInt(scanCode))
      .then((result) => setData(result))
      .catch((error) => setAlert({message: `Loading Error: ${error}`, type: MessageStripDesign.Negative}))
      .finally(() => setLoading(false));
  }, []);
  return (
    <ContentTheme title={title} icon="manager-insight">
      <Title level="H1">
        {t("goodsReceipt")} #{id}
      </Title>
      <div>
        {data?.map((value) => (
          <Panel
              collapsed
              headerText={`${o(value.objectType)}: ${value.number}`}
          >
            <Title level="H3">
              <strong>{t("customer")}: </strong>
              {value.cardName}
            </Title>
            <Text>
              <strong>{t("address")}: </strong>
              {value.address}
            </Text>
            <GoodsReceiptVSExitReportTable data={value.lines} />
          </Panel>
        ))}
      </div>
      {data && data.length === 0 && (
        <MessageStrip hideCloseButton design="Warning">{t("noExitData")}</MessageStrip>
      )}
    </ContentTheme>
  );
}
