import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {useThemeContext} from "@/components/ThemeContext";
import {Card} from "@/components/ui/card";
import {useStockInfo} from "@/utils/stock-info";
import ClickableBinCode from "@/components/ClickableBinCode";
import ClickablePackageBarcode from "@/components/ClickablePackageBarcode";
import {ChevronRight, Package, Box, Grid3x3} from "lucide-react";
import {ItemCheckResponse, ItemStockResponse} from "@/features/items/data/items";
import {itemsService} from "@/features/items/data/items-service";

interface StockTableProps {
  result: ItemCheckResponse
}

const ItemCheckStock: React.FC<StockTableProps> = ({result}) => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const stockInfo = useStockInfo();
  const [data, setData] = useState<ItemStockResponse[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (result && result.itemCode) {
      setLoading(true);
      itemsService.itemStock(result.itemCode)
        .then((data) => setData(data))
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
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

  const formatStock = (binStock: ItemStockResponse) => {
    const packages = Math.floor(binStock.quantity / (result.numInBuy * result.purPackUn));
    const remainingForDozens = binStock.quantity % (result.numInBuy * result.purPackUn);
    const dozens = Math.floor(remainingForDozens / result.numInBuy);
    const units = remainingForDozens % result.numInBuy;
    
    const parts = [];
    if (packages > 0) parts.push(`${packages} ${result.purPackMsr || 'Box'}`);
    if (dozens > 0) parts.push(`${dozens} ${result.buyUnitMsr || 'Doz'}`);
    if (units > 0) parts.push(`${units} ${t('units')}`);
    return parts.join(', ') || '0';
  };

  const getStockBreakdown = (binStock: ItemStockResponse) => {
    const packages = Math.floor(binStock.quantity / (result.numInBuy * result.purPackUn));
    const remainingForDozens = binStock.quantity % (result.numInBuy * result.purPackUn);
    const dozens = Math.floor(remainingForDozens / result.numInBuy);
    const units = remainingForDozens % result.numInBuy;
    return { packages, dozens, units };
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

    return { totalLocations, totalBoxes, mixedBoxes };
  };

  if (!result) {
    return null;
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-4">
      <Card className="p-0 gap-0">
        {data.map((binStock, index) => {
          const hasPackages = binStock.packages && binStock.packages.length > 0;
          const isExpanded = expandedRows.has(binStock.binEntry);
          const { packages, dozens, units } = getStockBreakdown(binStock);

          return (
            <div key={index} className={`${index !== 0 ? 'border-t' : ''}`}>
              <div
                onClick={() => hasPackages ? toggleRow(binStock.binEntry) : null}
                className={`flex items-center justify-between p-4 ${hasPackages ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    <ClickableBinCode binEntry={binStock.binEntry} binCode={binStock.binCode} />
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatStock(binStock)}
                  </p>
                </div>

                <div className="flex items-center">
                  <div className="flex gap-1">
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                      packages > 0 ? 'bg-blue-500' : 'bg-gray-200'
                    }`}>
                      {t('inventory.units.box.abbr')}
                    </span>
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                      dozens > 0 ? 'bg-green-500' : 'bg-gray-200'
                    }`}>
                      {t('inventory.units.dozen.abbr')}
                    </span>
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                      units > 0 ? 'bg-amber-500' : 'bg-gray-200'
                    }`}>
                      {t('inventory.units.unit.abbr')}
                    </span>
                  </div>
                </div>

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
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{result.purPackMsr || t('boxes')}</p>
                      <p className="text-lg font-semibold text-gray-900">{packages}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{result.buyUnitMsr || t('dozens')}</p>
                      <p className="text-lg font-semibold text-gray-900">{dozens}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{t('units')}</p>
                      <p className="text-lg font-semibold text-gray-900">{units}</p>
                    </div>
                  </div>
                  
                  {binStock.packages && binStock.packages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t('inventory.mixedBoxes')}</p>
                      <div className="space-y-1">
                        {binStock.packages.map((pkg, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <ClickablePackageBarcode 
                              packageId={pkg.id} 
                              barcode={pkg.barcode}
                              className="text-gray-600 font-mono"
                            />
                            <span className="text-gray-900 font-medium">
                              {stockInfo({
                                quantity: pkg.quantity,
                                numInBuy: result.numInBuy,
                                buyUnitMsr: result.buyUnitMsr,
                                purPackUn: result.purPackUn,
                                purPackMsr: result.purPackMsr,
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      {t('total')}: <span className="font-semibold text-gray-900">{binStock.quantity} {t('units')}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {t('noStockDataFound')}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Grid3x3 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.totalLocations}</p>
          <p className="text-xs text-gray-500 mt-1">{t('inventory.totalLocations')}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.totalBoxes}</p>
          <p className="text-xs text-gray-500 mt-1">{t('inventory.totalBoxes')}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Box className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totals.mixedBoxes}</p>
          <p className="text-xs text-gray-500 mt-1">{t('inventory.mixedBoxes')}</p>
        </Card>
      </div>
    </div>
  )
};
export default ItemCheckStock;