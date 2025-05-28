import * as React from 'react';
import {GoodsReceiptVSExitReportDataLine} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {MetricRow} from "@/components/MetricRow";
import {formatNumber} from "@/lib/utils";

interface GoodsReceiptVSExitReportTableProps {
  data: GoodsReceiptVSExitReportDataLine[]
}

const GoodsReceiptVSExitReportTable: React.FC<GoodsReceiptVSExitReportTableProps> = ({data}) => {
  const {t} = useTranslation();

  return (
    <div className="gap-2">
      {data.map((row, index) => {
        return <Card key={index}>
          <CardHeader>
            <CardTitle>{`${t('code')}: ${row.itemCode}`}</CardTitle>
            <CardDescription>{`${t('description')}: ${row.itemName}`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center border-b-2 border-primary font-bold">
              <div className="w-[30%]">
                <span>{t('unit')}</span>
              </div>
              <div className="flex-1 flex justify-around text-center">
                <div className="flex-1 text-xs">
                  <span>{t('units')}</span>
                </div>
                <div className="flex-1 text-xs">
                  <span>{row.buyUnitMsr ?? t('purPackUn')}</span>
                </div>
                <div className="flex-1 text-xs">
                  <span>{row.purPackMsr ?? t('packUn')}</span>
                </div>
              </div>
            </div>
            <MetricRow
              label={t('openQuantity')}
              values={{
                units: formatNumber(row.openQuantity, 0),
                buyUnits: formatNumber(row.openQuantity / row.numInBuy),
                packUnits: formatNumber(row.openQuantity / row.numInBuy / row.purPackUn)
              }}
            />
            <MetricRow
              label={t('quantity')}
              values={{
                units: formatNumber(row.quantity, 0),
                buyUnits: formatNumber(row.quantity / row.numInBuy),
                packUnits: formatNumber(row.quantity / row.numInBuy / row.purPackUn)
              }}
            />
          </CardContent>
        </Card>
      })}
    </div>
  );
}

export default GoodsReceiptVSExitReportTable;
