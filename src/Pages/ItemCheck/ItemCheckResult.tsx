import React from "react";
import {ItemCheckResponse} from "./Item";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ItemDetailsList from "./components/ItemDetailsList";
import BarcodeTable from "./components/BarcodeTable";
import StockTable from "./components/StockTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";

interface ItemCheckResultProps {
  result: ItemCheckResponse;
  submit: (itemCode: string, checkedBarcodes: string[], newBarcode: string) => void;
  onClear: () => void;
}

const ItemCheckResult: React.FC<ItemCheckResultProps> = ({result, submit, onClear}) => {
  const {t} = useTranslation();

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={onClear}>{t("itemCheck")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>{result.itemCode}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ItemDetailsList result={result}/>
      <Tabs defaultValue="barcodes" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="barcodes">{t("barcodes")}</TabsTrigger>
          <TabsTrigger value="stock">{t("stock")}</TabsTrigger>
        </TabsList>
        <TabsContent value="barcodes" className="mt-4">
          <BarcodeTable itemCode={result.itemCode} barcodes={result.barcodes} submit={submit}/>
        </TabsContent>
        <TabsContent value="stock" className="mt-4">
          <StockTable result={result}/>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default ItemCheckResult;
