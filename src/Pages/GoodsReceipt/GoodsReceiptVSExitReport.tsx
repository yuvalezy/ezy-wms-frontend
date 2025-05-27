import React, { useEffect, useState } from "react";
import ContentTheme from "../../components/ContentTheme";
import { useParams } from "react-router-dom";
import {
  fetchGoodsReceiptVSExitReport,
  GoodsReceiptVSExitReportData,
} from "./Data/Report";
import GoodsReceiptVSExitReportTable from "./Components/GoodsReceiptVSExitReportTable";
import { useThemeContext } from "../../Components/ThemeContext";
import { useTranslation } from "react-i18next";
import {Panel, Title, Text, MessageStrip} from "@ui5/webcomponents-react";
import {useObjectName} from "../../Assets/ObjectName";
import {IsNumeric} from "../../Assets/Functions";

export default function GoodsReceiptVSExitReport() {
  const [id, setID] = useState<number | null>();
  const { scanCode } = useParams();
  const { t } = useTranslation();
  const o = useObjectName();
  const {setLoading, setError} = useThemeContext();
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
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);
  return (
    <ContentThemeSapUI5 title={title} icon="manager-insight">
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
    </ContentThemeSapUI5>
  );
}
