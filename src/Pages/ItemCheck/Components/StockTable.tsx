import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {ItemCheckResponse, itemStock, ItemStockResponse} from "../Item";
import {useThemeContext} from "../../../Components/ThemeContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StockTableProps {
  result: ItemCheckResponse
}

const StockTable: React.FC<StockTableProps> = ({result}) => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [data, setData] = useState<ItemStockResponse[]>([]);

  useEffect(() => {
    setLoading(true);
    itemStock(result.itemCode)
      .then((data) => setData(data))
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('bin')}</TableHead>
            <TableHead>{t('quantity')}</TableHead>
            <TableHead>{result.buyUnitMsr}</TableHead>
            <TableHead>{result.purPackMsr}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((value, index) => (
            <TableRow key={index}>
              <TableCell>{value.binCode}</TableCell>
              <TableCell>{value.quantity}</TableCell>
              <TableCell>{(value.quantity / result.numInBuy).toFixed(2)}</TableCell>
              <TableCell>{(value.quantity / result.numInBuy / result.purPackUn).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default StockTable;
