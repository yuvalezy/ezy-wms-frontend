import React, {useEffect, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import {
  fetchGoodsReceiptValidateProcess,
  GoodsReceiptValidateProcess,
  ProcessLineStatus,
} from "./Data/Report";
import {useThemeContext} from "../../components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useObjectName} from "../../assets/ObjectName";
import {IsNumeric} from "../../assets/Functions";
import GoodsReceiptProcessDifferenceTable from "./components/GoodsReceiptProcessDifferenceTable";
import {exportToExcel} from "../../utils/excelExport";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage} from "@/components/ui/breadcrumb";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import InfoBox, { InfoBoxValue } from "@/components/InfoBox";

export default function GoodsReceiptProcessDifferenceReport() {
  const [id, setID] = useState<number | null>();
  const {scanCode} = useParams();
  const {t} = useTranslation();
  const o = useObjectName();
  const {setLoading, setError} = useThemeContext();
  const [data, setData] = useState<GoodsReceiptValidateProcess[] | null>(null);
  const navigate = useNavigate();
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
        let quantity = line.quantity;
        if (!itemMap[itemCode]) {
          itemMap[itemCode] = [itemCode, line.itemName, quantity];
        } else {
          itemMap[itemCode][2] = (itemMap[itemCode][2] as number) + quantity;
        }
        if (line.lineStatus !== ProcessLineStatus.OK && line.lineStatus !== ProcessLineStatus.ClosedLine) {
          issueFoundMap[itemCode] = true;
        }
      })
    });

    return Object.values(itemMap).filter((v) => issueFoundMap[v[0]]);
  }

  const handleExportExcel = () => {
    exportToExcel({
      name: "DifferenceReport",
      headers: excelHeaders,
      getData: excelData,
      fileName: `goods_receipt_differences_${id}`
    });
  };

  return (
    <ContentTheme title={title} exportExcel={true} onExportExcel={handleExportExcel}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#"
                            onClick={() => navigate('/goodsReceiptSupervisor')}>{t('supervisor')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>{t("differencesReport")} #${scanCode}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <>
        {id && data?.map((value) => (
          <>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>{`${o(value.baseType)}: ${value.documentNumber}`}</AccordionTrigger>
                <AccordionContent>
                  <InfoBox>
                    <InfoBoxValue label={t("supplier")} value={value.cardCode} />
                    <InfoBoxValue label={t("supplierName")} value={value.cardName} />
                  </InfoBox>
                  <GoodsReceiptProcessDifferenceTable id={id} data={value}/>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        ))}
      </>
      {data && data.length === 0 && (
        <Alert variant="default" className="mt-4 bg-yellow-100 border-yellow-400 text-yellow-700">
          <AlertDescription>{t("nodata")}</AlertDescription>
        </Alert>
      )}
    </ContentTheme>
  );
}
