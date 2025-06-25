import {ItemCheckResponse, ItemDetails} from "../item-check";
import {useTranslation} from "react-i18next";
import React from "react";
import InfoBox, {InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {Card, CardContent, useAuth} from "@/components";
import {CustomFieldType, useDateTimeFormat} from "@/assets";

const ItemDetailsList = ({details}: { details: ItemDetails }) => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();
  return <Card>
    <CardContent>
      <SecondaryInfoBox>
        <InfoBoxValue label={t("code")} value={details.itemCode}/>
        <InfoBoxValue label={t("description")} value={details.itemName}/>
        <InfoBoxValue label={t('purchasingUoM')} value={`${details.buyUnitMsr} ${details.numInBuy}`}/>
        <InfoBoxValue label={t('packagingUoM')} value={`${details.purPackMsr} ${details.purPackUn}`}/>
        {(user?.customFields?.["Items"]??[]).map((field, index) => {
          let customFieldValue = details.customFields?.[field.key];
          if (customFieldValue != null) {
            switch (field.type) {
              case CustomFieldType.Date:
                customFieldValue = dateFormat(customFieldValue);
                break;
              default:
                customFieldValue = customFieldValue.toString();
                break;
            }
          }
          return (
            <InfoBoxValue key={`${field.key}-${index}`} label={field.description}
                          value={customFieldValue}/>
          );
        })}
      </SecondaryInfoBox>
    </CardContent>
  </Card>
};
export default ItemDetailsList;