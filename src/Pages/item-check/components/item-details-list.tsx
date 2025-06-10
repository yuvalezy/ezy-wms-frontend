import {ItemCheckResponse, ItemDetails} from "../item-check";
import {useTranslation} from "react-i18next";
import React from "react";
import InfoBox, {InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {Card, CardContent} from "@/components";

const ItemDetailsList = ({details}: { details: ItemDetails }) => {
  const {t} = useTranslation();
  return <Card>
    <CardContent>
      <SecondaryInfoBox>
        <InfoBoxValue label={t("code")} value={details.itemCode}/>
        <InfoBoxValue label={t("description")} value={details.itemName}/>
        <InfoBoxValue label={t('purchasingUoM')} value={`${details.buyUnitMsr} ${details.numInBuy}`}/>
        <InfoBoxValue label={t('packagingUoM')} value={`${details.purPackMsr} ${details.purPackUn}`}/>
      </SecondaryInfoBox>
    </CardContent>
  </Card>
};
export default ItemDetailsList;
