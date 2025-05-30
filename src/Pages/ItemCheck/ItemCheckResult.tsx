import React from "react";
import {ItemCheckResponse} from "./Item";
import {useTranslation} from "react-i18next";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ItemDetailsList from "@/pages/ItemCheck/components/item-details-list";
import BarcodeTable from "@/pages/ItemCheck/components/barcode-table";
import StockTable from "@/pages/ItemCheck/components/stock-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface ItemCheckResultProps {
  result: ItemCheckResponse;
  submit: (itemCode: string, checkedBarcodes: string[], newBarcode: string) => void;
  onClear: () => void;
}

const ItemCheckResult: React.FC<ItemCheckResultProps> = ({result, submit, onClear}) => {
  const {t} = useTranslation();

  return (
    <>
      <ItemDetailsList result={result}/>
      <Tabs defaultValue="stock" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock">{t("stock")}</TabsTrigger>
          <TabsTrigger value="barcodes">{t("barcodes")}</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-4">
          <StockTable result={result}/>
        </TabsContent>
        <TabsContent value="barcodes" className="mt-4">
          <BarcodeTable itemCode={result.itemCode} barcodes={result.barcodes} submit={submit}/>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default ItemCheckResult;
