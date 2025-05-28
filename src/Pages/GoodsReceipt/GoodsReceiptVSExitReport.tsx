import React, { useEffect, useState } from "react";
import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import {
  fetchGoodsReceiptVSExitReport,
  GoodsReceiptVSExitReportData,
} from "./Data/Report";
import GoodsReceiptVSExitReportTable from "./components/GoodsReceiptVSExitReportTable"; // Corrected casing
import { useThemeContext } from "@/components/ThemeContext";
import { useTranslation } from "react-i18next";
import {useObjectName} from "@/assets/ObjectName";
import {IsNumeric} from "@/assets/Functions";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb"; // Using Card as an alternative to Panel for now

export default function GoodsReceiptVSExitReport() {
  const [id, setID] = useState<number | null>();
  const { scanCode } = useParams();
  const { t } = useTranslation();
  const o = useObjectName();
  const {setLoading, setError} = useThemeContext();
  const [data, setData] = useState<GoodsReceiptVSExitReportData[] | null>(null);
  const title = `${t("goodsReceiptVSExit")} #${scanCode}`;
  const navigate = useNavigate();

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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={() => navigate('/goodsReceiptSupervisor')}>{t('supervisor')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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
