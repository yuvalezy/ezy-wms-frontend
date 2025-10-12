import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Card} from "@/components/ui/card";
import ClickableItemCode from "@/components/ClickableItemCode";
import {Inbox} from "lucide-react";
import {BinContentResponse} from "@/features/items/data/items";
import {useAuth} from "@/components";
import {ExpandableStockRow} from "./ExpandableStockRow";
import {StockTotalsSummary} from "./StockTotalsSummary";
import {formatStock, getStockBreakdown} from "../utils/stock-calculations";

export const BinCheckResult: React.FC<{ content: BinContentResponse[] }> = ({content}) => {
  const {t} = useTranslation();
  const {user, unitSelection, defaultUnit} = useAuth();
  const [data, setData] = useState<BinContentResponse[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const settings = user!.settings;

  useEffect(() => {
    if (content) {
      setData(content);
    }
  }, [content]);

  const toggleRow = (itemCode: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemCode)) {
      newExpanded.delete(itemCode);
    } else {
      newExpanded.add(itemCode);
    }
    setExpandedRows(newExpanded);
  };


  const calculateTotals = () => {
    let totalItems = data.length;
    let totalBoxes = 0;
    let mixedBoxes = 0;
    const uniquePackages = new Set<string>();

    data.forEach(v => {
      const packages = Math.floor(v.onHand / (v.numInBuy * v.purPackUn));
      totalBoxes += packages;

      // Count unique package barcodes
      v.packages?.forEach(pkg => {
        uniquePackages.add(pkg.barcode);
      });
    });

    mixedBoxes = uniquePackages.size;

    return {totalItems, totalBoxes, mixedBoxes};
  };

  const totals = calculateTotals();

  if (!content || content.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
            <Inbox className="w-12 h-12 text-gray-400"/>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('binIsEmpty')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            {t('noBinContentFound')}
          </p>
        </div>

        <StockTotalsSummary
          totals={{
            primaryCount: 0,
            totalBoxes: 0,
            mixedBoxes: 0,
          }}
          enablePackages={user?.settings?.enablePackages}
          unitSelection={unitSelection}
          primaryLabel="totalItems"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-0 gap-0">
        {data.map((binContent, index) => {
          const hasPackages = binContent.packages && binContent.packages.length > 0;
          const isExpanded = expandedRows.has(binContent.itemCode);
          const stockBreakdown = getStockBreakdown(binContent, settings);
          const stockText = formatStock(
            binContent,
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
              onToggle={() => toggleRow(binContent.itemCode)}
              mainContent={
                <>
                  <div className="flex items-center gap-2">
                    <ClickableItemCode itemCode={binContent.itemCode} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {binContent.itemName}
                  </p>
                </>
              }
              stockText={stockText}
              stockBreakdown={stockBreakdown}
              packages={binContent.packages}
              totalQuantity={binContent.onHand}
              itemDetails={{
                numInBuy: binContent.numInBuy,
                purPackUn: binContent.purPackUn,
                purPackMsr: binContent.purPackMsr,
                buyUnitMsr: binContent.buyUnitMsr,
              }}
              unitSelection={unitSelection}
            />
          );
        })}

        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {t('noBinContentFound')}
          </div>
        )}
      </Card>

      <StockTotalsSummary
        totals={{
          primaryCount: totals.totalItems,
          totalBoxes: totals.totalBoxes,
          mixedBoxes: totals.mixedBoxes,
        }}
        enablePackages={user?.settings?.enablePackages}
        unitSelection={unitSelection}
        primaryLabel="totalItems"
      />
    </div>
  );
};