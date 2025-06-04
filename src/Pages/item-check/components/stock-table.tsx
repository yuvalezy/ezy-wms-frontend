import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {ItemCheckResponse, itemStock, ItemStockResponse} from "../item";
import {useThemeContext} from "@/components/ThemeContext";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components";

export interface StockInfoParams {
  quantity: number;
  numInBuy: number;
  buyUnitMsr: string;
  purPackUn: number;
  purPackMsr: string;
}

export const useStockInfo = () => {
  const {t} = useTranslation();
  return (params: StockInfoParams) => {
    const packages = Math.floor(params.quantity / (params.numInBuy * params.purPackUn));
    const remainingForDozens = params.quantity % (params.numInBuy * params.purPackUn);
    const dozens = Math.floor(remainingForDozens / params.numInBuy);
    const units = remainingForDozens % params.numInBuy;
    let response = '';
    if (packages > 0) {
      response = `${packages} ${params.purPackMsr.length > 0 ? params.purPackMsr : t('packUnit')} `;
    }

    if (dozens > 0) {
      if (response.length > 0)
        response += ', ';
      response += `${dozens} ${params.buyUnitMsr.length > 0 ? params.buyUnitMsr : t('buyUnit')} `;
    }

    if (units > 0) {
      if (response.length > 0)
        response += ', ';
      response += `${units} ${t('units')}`;
    }
    return response;
  };
}

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
