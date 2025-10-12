import { PackageContentDto } from '@/features/packages/types';
import { StockItem } from './stock-calculations';

/**
 * Adapts a PackageContentDto to match the StockItem interface
 * for use with stock calculation utilities
 */
export function packageContentToStockItem(content: PackageContentDto): StockItem {
  return {
    quantity: content.quantity,
    numInBuy: content.itemData?.quantityInUnit || 1,
    purPackUn: content.itemData?.quantityInPack || 1,
    purPackMsr: content.itemData?.packMeasure || null,
    buyUnitMsr: content.itemData?.unitMeasure || null,
  };
}

/**
 * Maps package breakdown naming (packs, dozens, units) to
 * our standard naming (packages, dozens, units)
 */
export function mapPackageBreakdown(breakdown: { packs: number; dozens: number; units: number }) {
  return {
    packages: breakdown.packs,
    dozens: breakdown.dozens,
    units: breakdown.units,
  };
}