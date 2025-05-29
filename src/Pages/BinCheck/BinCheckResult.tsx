import React, {useEffect, useState} from "react";
import {BinContentResponse} from "./Bins";
import {useTranslation} from "react-i18next";
import {Card, CardContent} from "@/components";
import {MetricRow} from "@/components";
import {formatNumber, wd} from "@/lib/utils";
import InfoBox, {InfoBoxValue} from "@/components/InfoBox";

export const BinCheckResult: React.FC<{ content: BinContentResponse[] }> = ({content}) => {
  const {t} = useTranslation();
  const [data, setData] = useState<BinContentResponse[]>([]);

  useEffect(() => {
    if (content) {
      setData(content);
    }
  }, [content]);

  if (!content || content.length === 0) {
    return <p className="text-center text-muted-foreground">{t('noBinContentFound')}</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((binContent, index) => {
        // Ensure numInBuy and purPackUn are not zero to avoid division by zero
        const numInBuy = binContent.numInBuy || 1;
        const purPackUn = binContent.purPackUn || 1;

        return (
          <Card key={index} className="w-full shadow-lg">
            <CardContent className="pb-4">
              <InfoBoxValue label={t('item')} value={binContent.itemCode}/>
              <InfoBoxValue label={t('description')} value={binContent.itemName}/>
              {/* Unit Headers */}
              <div className="flex justify-between items-center py-2 border-b-2 border-primary mb-2 font-bold text-sm">
                <div className="w-[30%]">
                  {/* This column is for the MetricRow label, so no header text needed here explicitly unless desired */}
                </div>
                <div className="flex-1 flex justify-around text-center">
                  <div className="flex-1 text-xs">
                    <span>{t('units')}</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <span>{wd(binContent.buyUnitMsr, t('buyUnit'))}</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <span>{wd(binContent.purPackMsr, t('packUnit'))}</span>
                  </div>
                </div>
              </div>
              {/* Metrics */}
              <MetricRow
                label={t('stock')}
                values={{
                  units: formatNumber(binContent.onHand),
                  buyUnits: formatNumber(binContent.onHand / numInBuy, 2),
                  packUnits: formatNumber(binContent.onHand / (numInBuy * purPackUn), 2)
                }}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
