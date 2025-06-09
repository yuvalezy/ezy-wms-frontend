import {ItemCheckResponse, ItemDetails} from "../item-check";
import {useTranslation} from "react-i18next";
import React from "react";
import InfoBox, {InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {Card, CardContent} from "@/components";

const ItemDetailsList = ({details}: { details: ItemDetails }) => {
  const {t} = useTranslation();
  const unitMeasure = details.buyUnitMsr && details.buyUnitMsr.length > 0 ? details.buyUnitMsr : t("qtyInUn");
  const packMeasure = details.purPackMsr && details.purPackMsr.length > 0 ? details.purPackMsr : t("packUn")
  return <Card>
    <CardContent>
      <SecondaryInfoBox>
        <InfoBoxValue label={t("code")} value={details.itemCode}/>
        <InfoBoxValue label={t("description")} value={details.itemName}/>
        <InfoBoxValue label={unitMeasure} value={`${details.numInBuy}`}/>
        <InfoBoxValue label={packMeasure} value={`${details.purPackUn}`}/>
      </SecondaryInfoBox>
    </CardContent>
  </Card>
};
export default ItemDetailsList;
