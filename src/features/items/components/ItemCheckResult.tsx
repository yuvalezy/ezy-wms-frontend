import React from "react";
import {useTranslation} from "react-i18next";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import ItemDetailsList from "@/features/items/components/ItemDetailsList";
import ItemCheckBarcodes from "@/features/items/components/ItemCheckBarcodes";
import ItemCheckStock from "@/features/items/components/ItemCheckStock";
import {ItemMetadataDisplay} from "@/features/items/components/ItemMetadataDisplay";
import {ItemCheckResponse} from "@/features/items/data/items";
import {useAuth} from "@/Components";

interface ItemCheckResultProps {
  result: ItemCheckResponse;
  submit: (itemCode: string, checkedBarcodes: string[], newBarcode: string) => void;
  onClear: () => void;
}

const ItemCheckResult: React.FC<ItemCheckResultProps> = ({result, submit, onClear}) => {
  const {t} = useTranslation();
  const {user} = useAuth();

  // Check if item has metadata configured
  const hasMetadata = user!.itemMetaData && user!.itemMetaData.length > 0;
  const gridCols = hasMetadata ? "grid-cols-3" : "grid-cols-2";

  return (
    <>
      <ItemDetailsList details={result}/>
      <Tabs defaultValue="stock" className="mt-4">
        <TabsList className={`grid w-full ${gridCols}`}>
          <TabsTrigger value="stock">{t("stock")}</TabsTrigger>
          <TabsTrigger value="barcodes">{t("barcodes")}</TabsTrigger>
          {hasMetadata && (
            <TabsTrigger value="metadata">{t("packages.metadata")}</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="stock" className="mt-4">
          <ItemCheckStock result={result}/>
        </TabsContent>
        <TabsContent value="barcodes" className="mt-4">
          <ItemCheckBarcodes itemCode={result.itemCode} barcodes={result.barcodes} submit={submit}/>
        </TabsContent>
        {hasMetadata && (
          <TabsContent value="metadata" className="mt-4">
            <ItemMetadataDisplay itemData={result} />
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}

export default ItemCheckResult;
