import * as React from 'react';
import {GoodsReceiptAllLine} from "@/pages/GoodsReceipt/data/Report";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useStockInfo} from "@/utils/stock-info";
import {useItemDetailsPopup} from "@/hooks/useItemDetailsPopup";
import {Link} from "react-router-dom";
import {useAuth} from "@/components";
import {Status} from "@/assets";

interface GoodsReceiptAllTableProps {
  data: GoodsReceiptAllLine[],
  onClick: (data: GoodsReceiptAllLine) => void,
  status: Status
}

const GoodsReceiptAllReportTable: React.FC<GoodsReceiptAllTableProps> = ({data, onClick, status}) => {
  const {t} = useTranslation();
  const stockInfo = useStockInfo();
  const {openItemDetails} = useItemDetailsPopup();
  const {user} = useAuth();

  const showTarget = user?.settings.goodsReceiptTargetDocuments;

  const showDetails = (row: GoodsReceiptAllLine) => {
    openItemDetails({
      itemCode: row.itemCode,
      itemName: row.itemName,
      numInBuy: row.numInBuy,
      buyUnitMsr: row.buyUnitMsr || "",
      purPackUn: row.purPackUn,
      purPackMsr: row.purPackMsr || ""
    });
  }

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
        {data.map((row) => {
          const inWarehouse = row.quantity - row.delivery - row.showroom;
          return (
            <>
              <TableRow key={row.itemCode}>
                <TableCell><Link
                  className="text-blue-600 hover:underline"
                  onClick={() => showDetails(row)} to={""}>{row.itemCode}</Link></TableCell>
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
              <TableRow className="sm:hidden">
                <TableCell className="bg-gray-100 border-b-1"
                           colSpan={allowModify ? 8 : 7}>{t('description')}: {row.itemName}</TableCell>
              </TableRow>
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default GoodsReceiptAllReportTable;
