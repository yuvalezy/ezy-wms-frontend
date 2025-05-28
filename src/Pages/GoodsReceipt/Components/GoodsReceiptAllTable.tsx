import * as React from 'react';
import {GoodsReceiptAll} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {MetricRow} from "@/components/MetricRow";
import {formatNumber} from "@/lib/utils"; // Using shadcn Label

interface GoodsReceiptAllTableProps {
  data: GoodsReceiptAll[]
  onClick: (data: GoodsReceiptAll) => void;
}

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
            <CardContent>
              {/* Unit Headers */}
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

              {/* Metrics */}
              <MetricRow
                label={t('quantity')}
                values={{
                  units: formatNumber(row.quantity, 0),
                  buyUnits: formatNumber(row.quantity / row.numInBuy),
                  packUnits: formatNumber(row.quantity / row.numInBuy / row.purPackUn)
                }}
              />

              <MetricRow
                label={t('delivery')}
                values={{
                  units: formatNumber(row.delivery, 0),
                  buyUnits: formatNumber(row.delivery / row.numInBuy),
                  packUnits: formatNumber(row.delivery / row.numInBuy / row.purPackUn)
                }}
              />

              <MetricRow
                label={t('showroom')}
                values={{
                  units: formatNumber(row.showroom, 0),
                  buyUnits: formatNumber(row.showroom / row.numInBuy),
                  packUnits: formatNumber(row.showroom / row.numInBuy / row.purPackUn)
                }}
              />

              <MetricRow
                label={t('inWarehouse')}
                values={{
                  units: formatNumber(inWarehouse, 0),
                  buyUnits: formatNumber(inWarehouse / row.numInBuy),
                  packUnits: formatNumber(inWarehouse / row.numInBuy / row.purPackUn)
                }}
              />

              <MetricRow
                label={t('stock')}
                values={{
                  units: formatNumber(row.stock, 0),
                  buyUnits: formatNumber(row.stock / row.numInBuy),
                  packUnits: formatNumber(row.stock / row.numInBuy / row.purPackUn)
                }}
              /> {/* Action Button */}
            </CardContent>
            <CardFooter className="text-center border-t pt-4">
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
