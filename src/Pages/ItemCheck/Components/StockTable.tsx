import {useTranslation} from "react-i18next";
import {Label, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import React, {useEffect, useState} from "react";
import {ItemCheckResponse, itemStock, ItemStockResponse} from "../Item";
import {useThemeContext} from "../../../Components/ThemeContext";

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
    <>
      <Table
        columns={
          <>
            <TableColumn><Label>{t('bin')}</Label></TableColumn>
            <TableColumn><Label>{t('quantity')}</Label></TableColumn>
            <TableColumn><Label>{result.buyUnitMsr}</Label></TableColumn>
            <TableColumn><Label>{result.purPackMsr}</Label></TableColumn>
          </>
        }
      >
        {data.map((value, index) => (
          <TableRow key={index}>
            <TableCell><Label>{value.binCode}</Label></TableCell>
            <TableCell><Label>{value.quantity}</Label></TableCell>
            <TableCell><Label>{value.quantity / result.numInBuy}</Label></TableCell>
            <TableCell><Label>{value.quantity / result.numInBuy / result.purPackUn}</Label></TableCell>
          </TableRow>
        ))}
      </Table>
    </>
  );
};
export default StockTable;
