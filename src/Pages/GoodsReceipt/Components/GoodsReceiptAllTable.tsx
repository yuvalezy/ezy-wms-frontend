import * as React from 'react';
import {GoodsReceiptAll} from "../Data/Report";
import {useTranslation} from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Using shadcn Label

interface GoodsReceiptAllTableProps {
  data: GoodsReceiptAll[]
  onClick: (data: GoodsReceiptAll) => void;
}

interface MetricRowProps {
  label: string;
  values: {
    units: string | number;
    buyUnits: string | number;
    packUnits: string | number;
  };
}

const MetricRow: React.FC<MetricRowProps> = ({label, values}) => (
  <div className="metric-row flex justify-between items-center py-2 border-b border-gray-200">
    <div className="w-[30%] font-medium">
      <span>{label}</span>
    </div>
    <div className="flex-1 flex justify-around text-center">
      <div className="flex-1">
        <span>{values.units}</span>
      </div>
      <div className="flex-1">
        <span>{values.buyUnits}</span>
      </div>
      <div className="flex-1">
        <span>{values.packUnits}</span>
      </div>
    </div>
  </div>
);

const GoodsReceiptAllReportTable: React.FC<GoodsReceiptAllTableProps> = ({data, onClick}) => {
  const {t} = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      {data.map((row) => {
        const inWarehouse = row.quantity - row.delivery - row.showroom;

        return (
          <Card key={row.itemCode} className="w-full shadow-lg">
            <CardHeader>
              <CardTitle>{`${t('code')}: ${row.itemCode}`}</CardTitle>
              <CardDescription>{`${t('description')}: ${row.itemName}`}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {/* Unit Headers */}
              <div className="flex justify-between items-center py-2 border-b-2 border-primary mb-2 font-bold">
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

              {/* Metrics */}
              <MetricRow
                label={t('quantity')}
                values={{
                  units: row.quantity,
                  buyUnits: (row.quantity / row.numInBuy).toFixed(2),
                  packUnits: (row.quantity / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              <MetricRow
                label={t('delivery')}
                values={{
                  units: row.delivery,
                  buyUnits: (row.delivery / row.numInBuy).toFixed(2),
                  packUnits: (row.delivery / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              <MetricRow
                label={t('showroom')}
                values={{
                  units: row.showroom,
                  buyUnits: (row.showroom / row.numInBuy).toFixed(2),
                  packUnits: (row.showroom / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              <MetricRow
                label={t('inWarehouse')}
                values={{
                  units: inWarehouse,
                  buyUnits: (inWarehouse / row.numInBuy).toFixed(2),
                  packUnits: (inWarehouse / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              <MetricRow
                label={t('stock')}
                values={{
                  units: row.stock,
                  buyUnits: (row.stock / row.numInBuy).toFixed(2),
                  packUnits: (row.stock / row.numInBuy / row.purPackUn).toFixed(2)
                }}
              />

              {/* Action Button */}
            </CardContent>
            <CardFooter className="mt-4 text-center border-t pt-4">
              <Button
                variant="default" /* or "secondary", "outline" etc. */
                onClick={() => onClick(row)}
                className="w-full"
              >
                {t('modifyValues')}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export default GoodsReceiptAllReportTable;
