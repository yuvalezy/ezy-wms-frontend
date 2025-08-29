import * as React from 'react';
import {GoodsReceiptAllLine} from "@/features/goods-receipt/data/goods-receipt-reports";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import {useAuth} from "@/components";
import {Status} from "@/features/shared/data";
import ItemDetailsLink from "@/components/ItemDetailsLink";

interface GoodsReceiptAllTableProps {
  data: GoodsReceiptAllLine[],
  onClick: (data: GoodsReceiptAllLine) => void,
  status: Status
}

const GoodsReceiptAllReportTable: React.FC<GoodsReceiptAllTableProps> = ({data, onClick, status}) => {
  const {t} = useTranslation();
  const stockInfo = useStockInfo();
  const {user} = useAuth();

  const showTarget = user?.settings.goodsReceiptTargetDocuments;

  const allowModify = status === Status.Open || status === Status.InProgress;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('code')}</TableHead>
          <TableHead className="hidden sm:table-cell">{t('description')}</TableHead>
          <TableHead>{t('quantity')}</TableHead>
          {showTarget && <TableHead>{t('delivery')}</TableHead>}
          {showTarget && <TableHead>{t('showroom')}</TableHead>}
          <TableHead>{t('inWarehouse')}</TableHead>
          <TableHead>{t('stock')}</TableHead>
          {allowModify && <TableHead className="border-l"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => {
          const inWarehouse = row.quantity - row.delivery - row.showroom;
          return (
            <React.Fragment key={`row-${index}`}>
              <TableRow key={`data-${index}`}>
                <TableCell><ItemDetailsLink data={row}/></TableCell>
                <TableCell className="hidden sm:table-cell">{row.itemName}</TableCell>
                <TableCell>{stockInfo({
                  quantity: row.quantity,
                  numInBuy: row.numInBuy,
                  buyUnitMsr: row.buyUnitMsr,
                  purPackUn: row.purPackUn,
                  purPackMsr: row.purPackMsr,
                })}</TableCell>
                {showTarget && <TableCell>{stockInfo({
                  quantity: row.delivery,
                  numInBuy: row.numInBuy,
                  buyUnitMsr: row.buyUnitMsr,
                  purPackUn: row.purPackUn,
                  purPackMsr: row.purPackMsr,
                })}</TableCell>}
                {showTarget && <TableCell>{stockInfo({
                  quantity: row.showroom,
                  numInBuy: row.numInBuy,
                  buyUnitMsr: row.buyUnitMsr,
                  purPackUn: row.purPackUn,
                  purPackMsr: row.purPackMsr,
                })}</TableCell>}
                <TableCell>{stockInfo({
                  quantity: inWarehouse,
                  numInBuy: row.numInBuy,
                  buyUnitMsr: row.buyUnitMsr,
                  purPackUn: row.purPackUn,
                  purPackMsr: row.purPackMsr,
                })}</TableCell>
                <TableCell>{stockInfo({
                  quantity: row.stock,
                  numInBuy: row.numInBuy,
                  buyUnitMsr: row.buyUnitMsr,
                  purPackUn: row.purPackUn,
                  purPackMsr: row.purPackMsr,
                })}</TableCell>
                {allowModify && <TableCell className="border-l">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onClick(row)}
                  >
                    {t('modifyValues')}
                  </Button>
                </TableCell>}
              </TableRow>
              <TableRow className="sm:hidden" key={`description-${index}`}>
                <TableCell className="bg-gray-100 border-b-1"
                           colSpan={allowModify ? 8 : 7}>{t('description')}: {row.itemName}</TableCell>
              </TableRow>
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default GoodsReceiptAllReportTable;
