export interface ExcelQuantityFormatParams {
  quantity: number;
  numInBuy: number;
  buyUnitMsr?: string;
  purPackUn: number;
  purPackMsr?: string;
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