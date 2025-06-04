import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {ItemCheckResponse, itemStock, ItemStockResponse} from "../item";
import {useThemeContext} from "@/components/ThemeContext";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components";
import {useStockInfo} from "@/utils/stock-info";

interface StockTableProps {
  result: ItemCheckResponse
}

const StockTable: React.FC<StockTableProps> = ({result}) => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const stockInfo = useStockInfo();
  const [data, setData] = useState<ItemStockResponse[]>([]);

  useEffect(() => {
    if (result && result.itemCode) {
      setLoading(true);
      itemStock(result.itemCode)
        .then((data) => setData(data))
        .catch((e) => setError(e))
        .finally(() => setLoading(false));
    }
  }, [result, setLoading, setError]);

  if (!result) {
    return null; // Or some placeholder if result is not yet available
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('bin')}</TableHead>
          <TableHead>{t('stock')}</TableHead>
        </TableRow>
      </TableHeader>
      {data.length > 0 && (
        <TableBody>
          {data.map((binStock, index) => {

            return (
              <TableRow key={index}>
                <TableCell>{binStock.binCode}</TableCell>
                <TableCell>
                  {stockInfo({
                    quantity: binStock.quantity,
                    numInBuy: result.numInBuy,
                    buyUnitMsr: result.buyUnitMsr,
                    purPackUn: result.purPackUn,
                    purPackMsr: result.purPackMsr,
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      )}
      {data.length === 0 && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>{t('noStockDataFound')}</TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )
};
export default StockTable;
