import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ClickablePackageBarcode from '@/components/ClickablePackageBarcode';
import { useStockInfo } from '@/utils/stock-info';
import { InventoryUnitIndicators } from '@/components/InventoryUnitIndicators';
import { StockBreakdown } from '../utils/stock-calculations';
import {PackageStockValue} from "@/components";

export interface Package {
  id: string | number;
  barcode: string;
  quantity: number;
}

interface ExpandableStockRowProps {
  index: number;
  isExpanded: boolean;
  hasPackages: boolean | null | undefined;
  onToggle: () => void;
  mainContent: React.ReactNode;
  stockText: string;
  stockBreakdown: StockBreakdown;
  packages?: PackageStockValue[] | null;
  totalQuantity: number;
  itemDetails: {
    numInBuy: number;
    purPackUn: number;
    purPackMsr?: string | null;
    buyUnitMsr?: string | null;
  };
  unitSelection: boolean;
}

export const ExpandableStockRow: React.FC<ExpandableStockRowProps> = ({
  index,
  isExpanded,
  hasPackages,
  onToggle,
  mainContent,
  stockText,
  stockBreakdown,
  packages,
  totalQuantity,
  itemDetails,
  unitSelection,
}) => {
  const { t } = useTranslation();
  const stockInfo = useStockInfo();

  return (
    <div className={`${index !== 0 ? 'border-t' : ''}`}>
      <div
        onClick={() => hasPackages ? onToggle() : null}
        className={`flex items-center justify-between p-4 ${hasPackages ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
      >
        <div className="flex-1 min-w-0">
          {mainContent}
          <p className="text-sm text-gray-600 mt-1">
            {stockText}
          </p>
        </div>

        {unitSelection && (
          <InventoryUnitIndicators
            packages={stockBreakdown.packages}
            dozens={stockBreakdown.dozens}
            units={stockBreakdown.units}
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
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {itemDetails.purPackMsr || t('boxes')}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {stockBreakdown.packages}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {itemDetails.buyUnitMsr || t('dozens')}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {stockBreakdown.dozens}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {t('units')}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {stockBreakdown.units}
              </p>
            </div>
          </div>

          {packages && packages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                {t('inventory.mixedBoxes')}
              </p>
              <div className="space-y-1">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <ClickablePackageBarcode
                      packageId={pkg.id}
                      barcode={pkg.barcode}
                      className="text-gray-600 font-mono"
                    />
                    <span className="text-gray-900 font-medium">
                      {stockInfo({
                        quantity: pkg.quantity,
                        numInBuy: itemDetails.numInBuy,
                        buyUnitMsr: itemDetails.buyUnitMsr,
                        purPackUn: itemDetails.purPackUn,
                        purPackMsr: itemDetails.purPackMsr,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t('total')}: <span className="font-semibold text-gray-900">
                {totalQuantity} {t('units')}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};