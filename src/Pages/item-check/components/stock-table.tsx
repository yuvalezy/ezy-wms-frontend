import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {ItemCheckResponse, itemStock, ItemStockResponse} from "../item";
import {useThemeContext} from "@/components/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricRow } from "@/components/MetricRow";
import {formatNumber} from "@/lib/utils";

interface StockTableProps {
  result: ItemCheckResponse
}

const StockTable: React.FC<StockTableProps> = ({result}) => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [data, setData] = useState<ItemStockResponse[]>([]);

  useEffect(() => {
    if (result && result.itemCode) {
      setLoading(true);
      itemStock(result.itemCode)
        .then((data) => setData(data))
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    }
  }, [result, setLoading, setError]);

  if (!result) {
    return null; // Or some placeholder if result is not yet available
  }
  
  // Ensure result.numInBuy and result.purPackUn are not zero to avoid division by zero
  const numInBuy = result.numInBuy || 1;
  const purPackUn = result.purPackUn || 1;

  return (
    <div className="space-y-4">
      {data.length === 0 && (
        <p className="text-center text-muted-foreground">{t('noStockDataFound')}</p>
      )}
      {data.map((binStock, index) => (
        <Card key={index} className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>{t('bin')}: {binStock.binCode}</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
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
                  <span>{result.buyUnitMsr ?? t('buyUnit')}</span>
                </div>
                <div className="flex-1 text-xs">
                  <span>{result.purPackMsr ?? t('packUnit')}</span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <MetricRow
              label={t('stock')}
              values={{
                units: formatNumber(binStock.quantity),
                buyUnits: formatNumber(binStock.quantity / numInBuy, 2),
                packUnits: formatNumber(binStock.quantity / (numInBuy * purPackUn), 2)
              }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default StockTable;
