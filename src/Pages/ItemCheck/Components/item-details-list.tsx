import {ItemCheckResponse} from "../Item";
import {useTranslation} from "react-i18next";
import React from "react";
import InfoBox, {InfoBoxValue} from "@/components/InfoBox";

interface ItemDetailsListProps {
    result: ItemCheckResponse;
}
const ItemDetailsList : React.FC<ItemDetailsListProps> = ({result}) => {
    const { t } = useTranslation();
    return <InfoBox>
      <InfoBoxValue label={t("code")} value={result.itemCode}/>
      <InfoBoxValue label={t("description")} value={result.itemName}/>
      <InfoBoxValue label={t("qtyInUn")} value={`${result.numInBuy} ${result.buyUnitMsr}`}/>
      <InfoBoxValue label={t("packUn")} value={`${result.purPackUn} ${result.purPackMsr}`}/>
    </InfoBox>
};
export default ItemDetailsList;
