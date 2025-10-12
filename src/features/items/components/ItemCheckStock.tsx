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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
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

  const toggleRow = (binEntry: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(binEntry)) {
      newExpanded.delete(binEntry);
    } else {
      newExpanded.add(binEntry);
    }
    setExpandedRows(newExpanded);
  };


  const calculateTotals = () => {
    let totalLocations = data.length;
    let totalQuantity = 0;
    let totalBoxes = 0;
    let mixedBoxes = 0;
    data.forEach(v => {
      mixedBoxes += v.packages?.length || 0;
      totalQuantity += v.quantity;
    });

    totalBoxes = Math.floor(totalQuantity / (result.numInBuy * result.purPackUn));

    return {totalLocations, totalBoxes, mixedBoxes};
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
          const hasPackages = binStock.packages && binStock.packages.length > 0;
          const isExpanded = expandedRows.has(binStock.binEntry ?? -1);
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
              isExpanded={isExpanded}
              hasPackages={hasPackages}
              onToggle={() => toggleRow(binStock.binEntry ?? -1)}
              mainContent={
                binStock.binEntry && (
                  <p className="text-sm font-medium text-gray-900 truncate">
                    <ClickableBinCode binEntry={binStock.binEntry} binCode={binStock.binCode!} />
                  </p>
                )
              }
              stockText={stockText}
              stockBreakdown={stockBreakdown}
              packages={binStock.packages}
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
          mixedBoxes: totals.mixedBoxes,
        }}
        enablePackages={user?.settings?.enablePackages}
        unitSelection={unitSelection}
        primaryLabel="inventory.totalLocations"
      />
    </div>
  )
};
export default ItemCheckStock;