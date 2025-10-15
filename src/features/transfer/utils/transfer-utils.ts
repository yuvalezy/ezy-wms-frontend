import {TransferDocument} from "@/features/transfer/data/transfer";

/**
 * Determines if a transfer is cross-warehouse based on source and target warehouse codes
 * @param info Transfer document information
 * @returns true if transfer is between different warehouses
 */
export const isCrossWarehouseTransfer = (info: TransferDocument | null): boolean => {
  if (!info) return false;

  const sourceWhs = info.sourceWhsCode || info.whsCode;
  return !!(info.targetWhsCode && info.targetWhsCode !== sourceWhs);
};

/**
 * Gets the source warehouse code from transfer document
 * @param info Transfer document information
 * @returns source warehouse code
 */
export const getSourceWarehouse = (info: TransferDocument | null): string | undefined => {
  return info?.sourceWhsCode || info?.whsCode;
};

/**
 * Checks if a transfer can be finished based on its state
 * @param info Transfer document information
 * @param isWaitingForApproval Whether transfer is waiting for approval
 * @returns true if transfer can be finished
 */
export const canFinishTransfer = (
  info: TransferDocument | null,
  isWaitingForApproval: boolean
): boolean => {
  if (!info || isWaitingForApproval) return false;

  const crossWarehouse = isCrossWarehouseTransfer(info);
  return crossWarehouse ? (info.progress ?? 0) > 0 : !!info.isComplete;
};
