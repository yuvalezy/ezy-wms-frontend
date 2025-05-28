import React, { useEffect, useState } from "react";
import ContentTheme from "../../components/ContentTheme";
import { useParams } from "react-router-dom";
import {
  fetchGoodsReceiptVSExitReport,
  GoodsReceiptVSExitReportData,
} from "./Data/Report";
import GoodsReceiptVSExitReportTable from "./Components/GoodsReceiptVSExitReportTable"; // Corrected casing
import { useThemeContext } from "../../components/ThemeContext";
import { useTranslation } from "react-i18next";
import {useObjectName} from "../../Assets/ObjectName";
import {IsNumeric} from "../../Assets/Functions";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Using Card as an alternative to Panel for now

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
    <ContentTheme title={title}>
      <h1 className="text-2xl font-bold mb-4">
        {t("goodsReceipt")} #{id}
      </h1>
      <div className="space-y-4">
        {data?.map((value, index) => (
          <Accordion key={index} type="single" collapsible className="w-full">
            <AccordionItem value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                {`${o(value.objectType)}: ${value.number}`}
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">
                      <strong>{t("customer")}: </strong>
                      {value.cardName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">
                      <strong>{t("address")}: </strong>
                      {value.address}
                    </p>
                    <GoodsReceiptVSExitReportTable data={value.lines} />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
      {data && data.length === 0 && (
         <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
            {/* <AlertTitle>{t("warning")}</AlertTitle> */}
            <AlertDescription>{t("noExitData")}</AlertDescription>
          </Alert>
      )}
    </ContentTheme>
  );
}
