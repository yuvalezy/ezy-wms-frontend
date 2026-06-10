import React from 'react';
import { useTranslation } from 'react-i18next';
import { InventoryUnitIndicators } from '@/components/InventoryUnitIndicators';
import { StockBreakdown } from '../utils/stock-calculations';

interface ExpandableStockRowProps {
  index: number;
  mainContent: React.ReactNode;
  stockText: string;
  stockBreakdown: StockBreakdown;
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
  mainContent,
  stockText,
  stockBreakdown,
  totalQuantity,
  itemDetails,
  unitSelection,
}) => {
  const { t } = useTranslation();

  return (
    <div className={`${index !== 0 ? 'border-t' : ''}`}>
      <div
        className="flex items-center justify-between p-4 transition-colors"
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

      </div>

      {unitSelection && (
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
