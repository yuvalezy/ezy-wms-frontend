import * as React from 'react';
import {GoodsReceiptAll} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Label, Table, TableCell, TableColumn, TableGroupRow, TableRow} from '@ui5/webcomponents-react';
import {formatValueByPack} from "../../../Assets/Quantities";

interface GoodsReceiptAllTableProps {
  data: GoodsReceiptAll[]
  onClick: (data: GoodsReceiptAll) => void;
}

const GoodsReceiptAllReportTable: React.FC<GoodsReceiptAllTableProps> = ({data, onClick}) => {
  const {t} = useTranslation();

  return <Table
    columns={<>
      <TableColumn><Label>{t('unit')}</Label></TableColumn>
      <TableColumn><Label>{t('quantity')}</Label></TableColumn>
      <TableColumn><Label>{t('delivery')}</Label></TableColumn>
      <TableColumn><Label>{t('showroom')}</Label></TableColumn>
      <TableColumn><Label>{t('inWarehouse')}</Label></TableColumn>
      <TableColumn><Label>{t('stock')}</Label></TableColumn>
    </>}
  >
    {data.map((row) => {
      let inWarehouse = row.quantity - row.delivery - row.showroom;
      return <>
        <TableGroupRow>
          <Label>{t('code')}: {row.itemCode}, {t('description')}: {row.itemName}</Label>
        </TableGroupRow>
        <TableRow style={{cursor: 'pointer'}} onClick={() => onClick(row)} key={row.itemCode}>
          <TableCell className="clickCell">{t('units')}</TableCell>
          <TableCell className="clickCell">{row.quantity}</TableCell>
          <TableCell className="clickCell">{row.delivery}</TableCell>
          <TableCell className="clickCell">{row.showroom}</TableCell>
          <TableCell className="clickCell">{inWarehouse}</TableCell>
          <TableCell className="clickCell">{row.stock}</TableCell>
        </TableRow>
        <TableRow style={{cursor: 'pointer'}} onClick={() => onClick(row)} key={row.itemCode}>
          <TableCell className="clickCell">{t('purPackUn')}</TableCell>
          <TableCell className="clickCell">{(row.quantity / row.numInBuy).toFixed(2)}</TableCell>
          <TableCell className="clickCell">{(row.delivery / row.numInBuy).toFixed(2)}</TableCell>
          <TableCell className="clickCell">{(row.showroom / row.numInBuy).toFixed(2)}</TableCell>
          <TableCell className="clickCell">{(inWarehouse / row.numInBuy).toFixed()}</TableCell>
          <TableCell className="clickCell">{(row.stock / row.numInBuy).toFixed(2)}</TableCell>
        </TableRow>
        <TableRow style={{cursor: 'pointer'}} onClick={() => onClick(row)} key={row.itemCode}>
          <TableCell className="clickCell">{t('packUn')}</TableCell>
          <TableCell className="clickCell">{(row.quantity / row.numInBuy / row.purPackUn).toFixed(2)}</TableCell>
          <TableCell className="clickCell">{(row.delivery / row.numInBuy / row.purPackUn).toFixed(2)}</TableCell>
          <TableCell className="clickCell">{(row.showroom / row.numInBuy / row.purPackUn).toFixed(2)}</TableCell>
          <TableCell className="clickCell">{(inWarehouse / row.numInBuy / row.purPackUn).toFixed()}</TableCell>
          <TableCell className="clickCell">{(row.stock / row.numInBuy / row.purPackUn).toFixed(2)}</TableCell>
        </TableRow>
      </>;
    })}
  </Table>;
}

export default GoodsReceiptAllReportTable;