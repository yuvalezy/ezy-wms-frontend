import { UnitType } from '@/features/shared/data';
import { TFunction } from 'i18next';

export interface StockItem {
  quantity?: number;
  onHand?: number;
  numInBuy: number;
  purPackUn: number;
  purPackMsr?: string | null;
  buyUnitMsr?: string | null;
}

export interface StockBreakdown {
  packages: number;
  dozens: number;
  units: number;
}

export interface UserSettings {
  maxUnitLevel?: UnitType;
  enablePackages?: boolean;
}

/**
 * Calculates the breakdown of stock into packages, dozens, and units
 */
export function getStockBreakdown(
  item: StockItem,
  settings: UserSettings
): StockBreakdown {
  const quantity = item.quantity ?? item.onHand ?? 0;

  const packages = item.purPackUn === 1
    ? 0
    : Math.floor(quantity / (item.numInBuy * item.purPackUn));

  const remainingForDozens = item.purPackUn === 1
    ? quantity
    : quantity % (item.numInBuy * item.purPackUn);

  let dozens: number;
  let units: number;

  if (settings.maxUnitLevel === UnitType.Dozen) {
    dozens = remainingForDozens / item.numInBuy;
    units = 0;
  } else {
    dozens = Math.floor(remainingForDozens / item.numInBuy);
    units = remainingForDozens % item.numInBuy;
  }

  return { packages, dozens, units };
}

/**
 * Formats stock quantity into a human-readable string
 */
export function formatStock(
  item: StockItem,
  settings: UserSettings,
  unitSelection: boolean,
  defaultUnit: UnitType,
  t: TFunction
): string {
  const quantity = item.quantity ?? item.onHand ?? 0;

  if (!unitSelection) {
    switch (defaultUnit) {
      case UnitType.Unit:
        return `${quantity} ${t('units')}`;
      case UnitType.Dozen:
        return `${quantity / item.numInBuy} ${t('units')}`;
      case UnitType.Pack:
        return `${quantity / item.numInBuy / item.purPackUn} ${t('units')}`;
    }
  }

  const { packages, dozens, units } = getStockBreakdown(item, settings);

  const parts = [];
  if (packages > 0) parts.push(`${packages} ${item.purPackMsr || 'Box'}`);
  if (dozens > 0) parts.push(`${dozens} ${item.buyUnitMsr || 'Doz'}`);
  if (units > 0) parts.push(`${units} ${t('units')}`);

  return parts.join(', ') || '0';
}