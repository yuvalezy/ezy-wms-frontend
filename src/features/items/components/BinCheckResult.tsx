import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Card} from "@/components/ui/card";
import {useStockInfo} from "@/utils/stock-info";
import ClickableItemCode from "@/components/ClickableItemCode";
import ClickablePackageBarcode from "@/components/ClickablePackageBarcode";
import {Box, ChevronRight, Grid3x3, Inbox, Package} from "lucide-react";
import {BinContentResponse} from "@/features/items/data/items";
import {useAuth} from "@/components";
import {UnitType} from "@/features/shared/data";
import {InventoryUnitIndicators} from "@/components/InventoryUnitIndicators";

export const BinCheckResult: React.FC<{ content: BinContentResponse[] }> = ({content}) => {
  const {t} = useTranslation();
  const {user, unitSelection, defaultUnit} = useAuth();
  const [data, setData] = useState<BinContentResponse[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const stockInfo = useStockInfo();

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

  const formatStock = (binContent: BinContentResponse) => {
    if (!unitSelection) {
      switch (defaultUnit) {
        case UnitType.Unit:
          return `${binContent.onHand} ${t('units')}`;
        case UnitType.Dozen:
          return `${binContent.onHand / binContent.numInBuy} ${t('units')}`;
        case UnitType.Pack:
          return `${binContent.onHand / binContent.numInBuy / binContent.purPackUn} ${t('units')}`;
      }
    }
    const packages = Math.floor(binContent.onHand / (binContent.numInBuy * binContent.purPackUn));
    const remainingForDozens = binContent.onHand % (binContent.numInBuy * binContent.purPackUn);
    const dozens = Math.floor(remainingForDozens / binContent.numInBuy);
    const units = remainingForDozens % binContent.numInBuy;

    const parts = [];
    if (packages > 0) parts.push(`${packages} ${binContent.purPackMsr || 'Box'}`);
    if (dozens > 0) parts.push(`${dozens} ${binContent.buyUnitMsr || 'Doz'}`);
    if (units > 0) parts.push(`${units} ${t('units')}`);
    return parts.join(', ') || '0';
  };

  const getStockBreakdown = (binContent: BinContentResponse) => {
    const packages = Math.floor(binContent.onHand / (binContent.numInBuy * binContent.purPackUn));
    const remainingForDozens = binContent.onHand % (binContent.numInBuy * binContent.purPackUn);
    const dozens = Math.floor(remainingForDozens / binContent.numInBuy);
    const units = remainingForDozens % binContent.numInBuy;
    return {packages, dozens, units};
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
            <Inbox className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('binIsEmpty')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            {t('noBinContentFound')}
          </p>
        </div>

        <div className={`grid grid-cols-${(user?.settings?.enablePackages ? "3" : "2")} gap-4`}>
          <Card className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Grid3x3 className="w-6 h-6 text-gray-400"/>
            </div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500 mt-1">{t('totalItems')}</p>
          </Card>

          <Card className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Package className="w-6 h-6 text-gray-400"/>
            </div>
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-500 mt-1">{unitSelection ? t('inventory.totalBoxes') : t('totalItems')}</p>
          </Card>

          {user?.settings?.enablePackages &&
              <Card className="p-4 text-center">
                  <div className="flex justify-center mb-2">
                      <Box className="w-6 h-6 text-gray-400"/>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500 mt-1">{t('inventory.mixedBoxes')}</p>
              </Card>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-0 gap-0">
        {data.map((binContent, index) => {
          const hasPackages = binContent.packages && binContent.packages.length > 0;
          const isExpanded = expandedRows.has(binContent.itemCode);
          const {packages, dozens, units} = getStockBreakdown(binContent);

          return (
            <div key={index} className={`${index !== 0 ? 'border-t' : ''}`}>
              <div
                onClick={() => hasPackages ? toggleRow(binContent.itemCode) : null}
                className={`flex items-center justify-between p-4 ${hasPackages ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <ClickableItemCode itemCode={binContent.itemCode}/>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {binContent.itemName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatStock(binContent)}
                  </p>
                </div>


                {unitSelection && (
                  <InventoryUnitIndicators
                    packages={packages}
                    dozens={dozens}
                    units={units}
                  />
                )}

                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform ml-2 ${
                    isExpanded ? 'rotate-90' : ''
                  } ${hasPackages ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>

              {hasPackages && isExpanded && (
                <div className="bg-gray-50 px-4 pb-4">
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <p
                        className="text-xs text-gray-500 uppercase tracking-wider">{binContent.purPackMsr || t('boxes')}</p>
                      <p className="text-lg font-semibold text-gray-900">{packages}</p>
                    </div>
                    <div className="text-center">
                      <p
                        className="text-xs text-gray-500 uppercase tracking-wider">{binContent.buyUnitMsr || t('dozens')}</p>
                      <p className="text-lg font-semibold text-gray-900">{dozens}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{t('units')}</p>
                      <p className="text-lg font-semibold text-gray-900">{units}</p>
                    </div>
                  </div>

                  {binContent.packages && binContent.packages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('inventory.mixedBoxes')}</p>
                      <div className="space-y-1">
                        {binContent.packages.map((pkg, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <ClickablePackageBarcode
                              packageId={pkg.id}
                              barcode={pkg.barcode}
                              className="text-gray-600 font-mono"
                            />
                            <span className="text-gray-900 font-medium">
                              {stockInfo({
                                quantity: pkg.quantity,
                                numInBuy: binContent.numInBuy,
                                buyUnitMsr: binContent.buyUnitMsr,
                                purPackUn: binContent.purPackUn,
                                purPackMsr: binContent.purPackMsr,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      {t('total')}: <span
                      className="font-semibold text-gray-900">{binContent.onHand} {t('units')}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {t('noBinContentFound')}
          </div>
        )}
      </Card>

      <div className={`grid grid-cols-${(user?.settings?.enablePackages ? "3" : "2")} gap-4`}>
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Grid3x3 className="w-6 h-6 text-gray-400"/>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.totalItems}</p>
          <p className="text-xs text-gray-500 mt-1">{t('totalItems')}</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Package className="w-6 h-6 text-gray-400"/>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.totalBoxes}</p>
          <p className="text-xs text-gray-500 mt-1">{unitSelection ? t('inventory.totalBoxes') : t('totalItems')}</p>
        </Card>

        {user?.settings?.enablePackages &&
            <Card className="p-4 text-center">
                <div className="flex justify-center mb-2">
                    <Box className="w-6 h-6 text-gray-400"/>
                </div>
                <p className="text-2xl font-bold text-gray-900">{totals.mixedBoxes}</p>
                <p className="text-xs text-gray-500 mt-1">{t('inventory.mixedBoxes')}</p>
            </Card>}
      </div>
    </div>
  );
};