import React from "react";
import {ItemCheckResponse} from "./Item";
import {useTranslation} from "react-i18next";
import {
    Card,
    CardHeader
} from "@ui5/webcomponents-react";
import ItemDetailsList from "./Components/ItemDetailsList";
import BarcodeTable from "./Components/BarcodeTable";

interface ItemCheckResultProps {
    result: ItemCheckResponse;
    submit: (itemCode: string, checkedBarcodes: string[], newBarcode: string) => void;
}

const ItemCheckResult: React.FC<ItemCheckResultProps> = ({result, submit}) => {
    const {t} = useTranslation();

    return (
        <Card header={<CardHeader titleText={`${t('code')}: ${result.itemCode}`}/>}>
            <ItemDetailsList result={result}/>
            <BarcodeTable itemCode={result.itemCode} barcodes={result.barcodes} submit={submit}/>
        </Card>
    )
}

export default ItemCheckResult;