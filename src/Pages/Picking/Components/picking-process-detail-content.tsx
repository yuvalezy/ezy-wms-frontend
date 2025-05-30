import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {PickingDocumentDetailItem} from "@/pages/picking/data/picking-document";
import BinLocationQuantities from "../../../components/BinLocationQuantities";
import {InfoBoxValue, MetricRow, SecondaryInfoBox} from "@/components";
import {formatNumber} from "@/lib/utils";

export interface PickingProcessDetailContentProps {
  items?: PickingDocumentDetailItem[];
}

export const PickingProcessDetailContent: React.FC<PickingProcessDetailContentProps> = ({items}) => {
  const {t} = useTranslation();
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(items?.some(i => i.available != null && i.available > 0) ?? false);
  }, [items]);

  return (
    <div className="contentStyle">
      {items?.map((row) => (
        <Card key={row.itemCode} className={`mb-4 ${row.openQuantity === 0 ? 'bg-green-100' : ''}`}>
          <CardHeader>
            <CardTitle>{row.itemCode} - {row.itemName}</CardTitle>
          </CardHeader>
          <CardContent>
            {!available ? <>
              <SecondaryInfoBox>
                <InfoBoxValue label={t('quantity')} value={row.quantity}/>
                <InfoBoxValue label={t('picked')} value={row.picked}/>
                <InfoBoxValue label={t('pending')} value={row.openQuantity}/>
                <InfoBoxValue label={t('qtyInUn')} value={row.numInBuy.toString()}/>
                <InfoBoxValue label={t('qtyInPack')} value={row.purPackUn.toString()}/>
              </SecondaryInfoBox>
              {row.openQuantity > 0 && row.binQuantities && row.binQuantities.length > 0 && (
                <div className="mt-4 bg-slate-50 rounded-md">
                  <BinLocationQuantities data={row}/>
                </div>
              )}
            </> : <>
              <SecondaryInfoBox>
                <InfoBoxValue label={t('qtyInUn')} value={row.numInBuy.toString()}/>
                <InfoBoxValue label={t('qtyInPack')} value={row.purPackUn.toString()}/>
              </SecondaryInfoBox>
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
              <MetricRow
                label={t('quantity')}
                values={{
                  units: formatNumber(row.quantity, 0),
                  buyUnits: formatNumber(row.quantity / row.numInBuy, 2),
                  packUnits: formatNumber(row.quantity / row.numInBuy / row.purPackUn, 2)
                }}
              />
              <MetricRow
                label={t('picked')}
                values={{
                  units: formatNumber(row.picked, 0),
                  buyUnits: formatNumber(row.picked / row.numInBuy, 2),
                  packUnits: formatNumber(row.picked / row.numInBuy / row.purPackUn, 2)
                }}
              />
              <MetricRow
                label={t('pending')}
                values={{
                  units: formatNumber(row.openQuantity, 0),
                  buyUnits: formatNumber(row.openQuantity / row.numInBuy, 2),
                  packUnits: formatNumber(row.openQuantity / row.numInBuy / row.purPackUn, 2)
                }}
              />
              <MetricRow
                label={t('available')}
                values={{
                  units: formatNumber(row.available ?? 0, 0),
                  buyUnits: formatNumber((row.available ?? 0) / row.numInBuy, 2),
                  packUnits: formatNumber((row.available ?? 0) / row.numInBuy / row.purPackUn, 2)
                }}
              />

            </>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default PickingProcessDetailContent;
