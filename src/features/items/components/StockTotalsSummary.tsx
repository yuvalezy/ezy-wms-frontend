import React from 'react';
import { Card } from '@/components/ui/card';
import { Grid3x3, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StockTotals {
  primaryCount: number;  // totalLocations for ItemCheckStock, totalItems for BinCheckResult
  totalBoxes: number;
}

interface StockTotalsSummaryProps {
  totals: StockTotals;
  unitSelection: boolean;
  primaryLabel: string;  // 'inventory.totalLocations' or 'totalItems'
}

export const StockTotalsSummary: React.FC<StockTotalsSummaryProps> = ({
  totals,
  unitSelection,
  primaryLabel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 text-center">
        <div className="flex justify-center mb-2">
          <Grid3x3 className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{totals.primaryCount}</p>
        <p className="text-xs text-gray-500 mt-1">{t(primaryLabel)}</p>
      </Card>

      <Card className="p-4 text-center">
        <div className="flex justify-center mb-2">
          <Package className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{totals.totalBoxes}</p>
        <p className="text-xs text-gray-500 mt-1">
          {unitSelection ? t('inventory.totalBoxes') : t('totalItems')}
        </p>
      </Card>
    </div>
  );
};
