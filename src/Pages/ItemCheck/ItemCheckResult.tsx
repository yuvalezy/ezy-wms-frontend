import React from "react";
import {ItemCheckResponse} from "./Item";
import {useTranslation} from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemDetailsList from "./components/ItemDetailsList";
import BarcodeTable from "./components/BarcodeTable";
import StockTable from "./components/StockTable";

interface ItemCheckResultProps {
    result: ItemCheckResponse;
    submit: (itemCode: string, checkedBarcodes: string[], newBarcode: string) => void;
}

const ItemCheckResult: React.FC<ItemCheckResultProps> = ({result, submit}) => {
    const {t} = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('code')}: {result.itemCode}</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
    )
}

export default ItemCheckResult;
