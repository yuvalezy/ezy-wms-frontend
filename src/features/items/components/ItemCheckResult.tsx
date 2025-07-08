import React from "react";
import {useTranslation} from "react-i18next";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ItemDetailsList from "@/features/items/components/ItemDetailsList";
import ItemCheckBarcodes from "@/features/items/components/ItemCheckBarcodes";
import ItemCheckStock from "@/features/items/components/ItemCheckStock";
import {ItemCheckResponse} from "@/features/items/data/items";

interface ItemCheckResultProps {
  result: ItemCheckResponse;
  submit: (itemCode: string, checkedBarcodes: string[], newBarcode: string) => void;
  onClear: () => void;
}

const ItemCheckResult: React.FC<ItemCheckResultProps> = ({result, submit, onClear}) => {
  const {t} = useTranslation();

  return (
    <>
      <ItemDetailsList details={result}/>
      <Tabs defaultValue="stock" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock">{t("stock")}</TabsTrigger>
          <TabsTrigger value="barcodes">{t("barcodes")}</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-4">
          <ItemCheckStock result={result}/>
        </TabsContent>
        <TabsContent value="barcodes" className="mt-4">
          <ItemCheckBarcodes itemCode={result.itemCode} barcodes={result.barcodes} submit={submit}/>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default ItemCheckResult;
