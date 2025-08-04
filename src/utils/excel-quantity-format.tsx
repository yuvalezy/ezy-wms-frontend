import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {useAuth} from "@/components";
import {formatNumber} from "@/utils/number-utils";

export interface ExcelQuantityFormatParams {
  quantity: number;
  numInBuy: number;
  purPackUn: number;
}

export interface ExcelQuantityResult {
  pack: number;
  dozen: number;
  unit: number;
}

/**
 * Formats quantity into separate pack, dozen, and unit values for Excel export
 * Based on the same logic as stock-info but returns individual numeric values
 */
export const formatQuantityForExcel = (params: ExcelQuantityFormatParams): ExcelQuantityResult => {
  const { quantity, numInBuy, purPackUn } = params;
  
  // Calculate packages (packs)
  const pack = Math.floor(quantity / (numInBuy * purPackUn));
  
  // Calculate remaining quantity after removing full packages
  const remainingForDozens = quantity % (numInBuy * purPackUn);
  
  // Calculate dozens from remaining quantity
  const dozen = Math.floor(remainingForDozens / numInBuy);
  
  // Calculate units from remaining quantity after dozens
  const unit = remainingForDozens % numInBuy;
  
  return {
    pack,
    dozen,
    unit
  };
};

/**
 * Returns Excel headers for quantity columns based on unit selection settings
 */
export const getExcelQuantityHeaders = (): string[] => {
  const {t} = useTranslation();
  const headers: string[] = [];
  const {unitSelection, enableUseBaseUn} = useAuth();

  if (unitSelection) {
    headers.push(
      t("inventory.units.box.label"),
      t("inventory.units.dozen.label"),
    );
    if (enableUseBaseUn) {
      headers.push(t("inventory.units.unit.label"));
    }
  } else {
    headers.push(t("quantity"));
  }
  
  return headers;
};

/**
 * Returns formatted Excel values for quantity columns based on unit selection settings
 */
export const getExcelQuantityValues = (params: ExcelQuantityFormatParams): string[] => {
  const {unitSelection, user} = useAuth();
  const values: string[] = [];
  
  if (unitSelection) {
    const quantities = formatQuantityForExcel(params);
    
    values.push(
      formatNumber(quantities.pack, 0),
      formatNumber(quantities.dozen, 0),
    );
    if (user?.settings.enableUseBaseUn) {
      values.push(formatNumber(quantities.unit, 0));
    }
  } else {
    values.push(formatNumber(params.quantity, 0));
  }
  
  return values;
};