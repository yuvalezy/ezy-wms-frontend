import {useTranslation} from "react-i18next";
import React from "react";
import InfoBox, {InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {Card, CardContent, useAuth} from "@/components";
import {CustomFieldType, useDateTimeFormat, CustomField} from "@/assets";
import {ItemCheckResponse, ItemDetails} from "@/features/items/data/items";

const ItemDetailsList = ({details}: { details: ItemDetails }) => {
  const {t} = useTranslation();
  return <SecondaryInfoBox>
    <InfoBoxValue label={t("code")} value={details.itemCode}/>
    <InfoBoxValue label={t("description")} value={details.itemName}/>
    <InfoBoxValue label={t('purchasingUoM')} value={`${details.buyUnitMsr} ${details.numInBuy}`}/>
    <InfoBoxValue label={t('packagingUoM')} value={`${details.purPackMsr} ${details.purPackUn}`}/>
    <ItemCustomFields
      customFields={details.customFields}
      render={(field, value, index) => (
        <InfoBoxValue
          key={`${field.key}-${index}`}
          label={field.description}
          value={value}
        />
      )}
    />
  </SecondaryInfoBox>
};

export const ItemCustomFields = ({
                                   customFields,
                                   render
                                 }: {
  customFields?: Record<string, unknown>;
  render: (field: CustomField, value: string | null, index: number) => React.ReactNode;
}) => {
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();

  return (
    <>
      {(user?.customFields?.["Items"] ?? []).map((field, index) => {
        let customFieldValue = customFields?.[field.key];
        if (customFieldValue != null) {
          switch (field.type) {
            case CustomFieldType.Date:
              customFieldValue = dateFormat(customFieldValue as Date);
              break;
            default:
              customFieldValue = customFieldValue.toString();
              break;
          }
        }
        return render(field, customFieldValue as string | null, index);
      })}
    </>
  );
};

export default ItemDetailsList;