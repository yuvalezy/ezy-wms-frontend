import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {useThemeContext} from "@/components/ThemeContext";
import {Card} from "@/components/ui/card";
import ClickableBinCode from "@/components/ClickableBinCode";
import {ItemBinStockResponse, ItemCheckResponse} from "@/features/items/data/items";
import {itemsService} from "@/features/items/data/items-service";
import {useAuth} from "@/components";
import {ItemCheckStockSkeleton} from "./ItemCheckStockSkeleton";
import {ExpandableStockRow} from "./ExpandableStockRow";
import {StockTotalsSummary} from "./StockTotalsSummary";
import {formatStock, getStockBreakdown} from "../utils/stock-calculations";

interface StockTableProps {
  result: ItemCheckResponse
}

const ItemCheckStock: React.FC<StockTableProps> = ({result}) => {
  const {t} = useTranslation();
  const {user, unitSelection, defaultUnit} = useAuth();
  const {setError} = useThemeContext();
  const [data, setData] = useState<ItemBinStockResponse[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState<boolean>(false);

  const settings = user!.settings;

  useEffect(() => {
    if (result && result.itemCode) {
      setIsLoadingStock(true);
      if (user!.binLocations) {
        itemsService.itemBinStock(result.itemCode)
          .then((data) => setData(data))
          .catch((e) => setError(e))
          .finally(() => setIsLoadingStock(false));
      } else {
        itemsService.itemStock(result.itemCode)
          .then((data) => setData(data))
          .catch((e) => setError(e))
          .finally(() => setIsLoadingStock(false));
      }
    }
  }, [result]);

  const calculateTotals = () => {
    let totalLocations = data.length;
    let totalQuantity = 0;
    data.forEach(v => {
      totalQuantity += v.quantity;
    });

    const totalBoxes = Math.floor(totalQuantity / (result.numInBuy * result.purPackUn));

    return {totalLocations, totalBoxes};
  };

  if (!result) {
    return null;
  }

  if (isLoadingStock) {
    return <ItemCheckStockSkeleton/>;
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-4">
      <Card className="p-0 gap-0">
        {data.map((binStock, index) => {
          const stockBreakdown = getStockBreakdown(
            { ...binStock, numInBuy: result.numInBuy, purPackUn: result.purPackUn },
            settings
          );
          const stockText = formatStock(
            { ...binStock, numInBuy: result.numInBuy, purPackUn: result.purPackUn,
              purPackMsr: result.purPackMsr, buyUnitMsr: result.buyUnitMsr },
            settings,
            unitSelection,
            defaultUnit,
            t
          );

          return (
            <ExpandableStockRow
              key={index}
              index={index}
              mainContent={
                binStock.binEntry && (
                  <p className="text-sm font-medium text-gray-900 truncate">
                    <ClickableBinCode binEntry={binStock.binEntry} binCode={binStock.binCode!} />
                  </p>
                )
              }
              stockText={stockText}
              stockBreakdown={stockBreakdown}
              totalQuantity={binStock.quantity}
              itemDetails={{
                numInBuy: result.numInBuy,
                purPackUn: result.purPackUn,
                purPackMsr: result.purPackMsr,
                buyUnitMsr: result.buyUnitMsr,
              }}
              unitSelection={unitSelection}
            />
          );
        })}

        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {t('noStockDataFound')}
          </div>
        )}
      </Card>

      <StockTotalsSummary
        totals={{
          primaryCount: totals.totalLocations,
          totalBoxes: totals.totalBoxes,
        }}
        unitSelection={unitSelection}
        primaryLabel="inventory.totalLocations"
      />
    </div>
  )
};
export default ItemCheckStock;
