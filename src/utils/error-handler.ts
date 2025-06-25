import { AddItemReturnValueType, StringFormat } from "@/assets";

export interface ErrorData {
  ItemCode?: string;
  BarCode?: string;
  ID?: string;
  BinEntry?: string;
  BinCode?: string;
  itemCode?: string;
}

export const getAddItemErrorMessage = (
  errorType: AddItemReturnValueType,
  errorData: ErrorData,
  t: (key: string) => string
): string => {
  switch (errorType) {
    case AddItemReturnValueType.ItemCodeNotFound:
      return StringFormat(t('itemCodeNotFound'), errorData.ItemCode);
    case AddItemReturnValueType.ItemCodeBarCodeMismatch:
      return StringFormat(t('itemCodeBarCodeMismatch'), errorData.BarCode, errorData.itemCode);
    case AddItemReturnValueType.TransactionIDNotExists:
      return StringFormat(t('transactionIDNotExists'), errorData.ID);
    case AddItemReturnValueType.NotStockItem:
      return StringFormat(t('notStockItem'), errorData.ItemCode, errorData.BarCode);
    case AddItemReturnValueType.ItemNotInWarehouse:
      return StringFormat(t('itemNotInWarehouse'), errorData.ItemCode, errorData.BarCode);
    case AddItemReturnValueType.BinNotExists:
      return StringFormat(t('binNotExists'), errorData.BinEntry);
    case AddItemReturnValueType.BinNotInWarehouse:
      return StringFormat(t('binNotInWarehouse'), errorData.BinCode);
    case AddItemReturnValueType.BinMissing:
      return t('binMissing');
    case AddItemReturnValueType.QuantityMoreAvailable:
      return StringFormat(t('quantityMoreAvailable'), errorData.ItemCode);
    default:
      return t('unknownError');
  }
};