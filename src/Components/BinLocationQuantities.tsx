import React from "react";
import {useTranslation} from "react-i18next";
import {PickingDocumentDetailItem} from "@/pages/picking/data/picking-document";
import {MetricRow} from "@/components/MetricRow";
import {formatNumber} from "@/lib/utils";

export interface BinLocationQuantitiesProps {
  data: PickingDocumentDetailItem
}

export const BinLocationQuantities: React.FC<BinLocationQuantitiesProps> = ({data}) => {
  const {t} = useTranslation();

  return <>
    <div className="flex justify-between items-center border-b-2 border-primary font-bold">
      <div className="w-[30%]">
        <span>{t('bin')}</span>
      </div>
      <div className="flex-1 flex justify-around text-center">
        <div className="flex-1 text-xs">
          <span>{t('units')}</span>
        </div>
        <div className="flex-1 text-xs">
          <span>{t('dozens')}</span>
        </div>
        <div className="flex-1 text-xs">
          <span>{t('boxes')}</span>
        </div>
      </div>
    </div>
    {data.binQuantities?.map((bin, index) =>
      <MetricRow
        label={bin.code}
        values={{
          units: formatNumber(bin.quantity, 0),
          buyUnits: formatNumber(bin.quantity / data.numInBuy, 2),
          packUnits: formatNumber(bin.quantity / data.numInBuy / data.purPackUn, 2)
        }}
      />)}
  </>
}

export default BinLocationQuantities;
