import {useStockInfo} from "@/utils/stock-info";
import {TransferContent} from "@/features/transfer/data/transfer";

interface TransferRowStockInfoProps {
  row: TransferContent;
  quantityField?: keyof Pick<TransferContent, 'quantity' | 'openQuantity' | 'binQuantity'>;
}

/**
 * Displays formatted stock information for a transfer content row
 * Reusable component to ensure consistent stock display across transfer pages
 */
export const TransferRowStockInfo = ({row, quantityField = 'quantity'}: TransferRowStockInfoProps) => {
  const stockInfo = useStockInfo();

  const quantity = quantityField === 'binQuantity'
    ? (row.binQuantity ?? 0)
    : row[quantityField] as number;

  return (
    <>
      {stockInfo({
        quantity,
        numInBuy: row.numInBuy,
        buyUnitMsr: row.buyUnitMsr,
        purPackUn: row.purPackUn,
        purPackMsr: row.purPackMsr,
      })}
    </>
  );
};
