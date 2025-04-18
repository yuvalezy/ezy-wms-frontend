import * as React from 'react';
import {GoodsReceiptAll} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Label, Table, TableCell, TableColumn, TableRow} from '@ui5/webcomponents-react';
import {formatValueByPack} from "../../../Assets/Quantities";

interface GoodsReceiptAllTableProps {
  data: GoodsReceiptAll[]
  onClick: (data: GoodsReceiptAll) => void;
  displayPackage: boolean;
}

const GoodsReceiptAllReportTable: React.FC<GoodsReceiptAllTableProps> = ({data, onClick, displayPackage}) => {
  const {t} = useTranslation();

  return <Table
      columns={<>
        <TableColumn><Label>{t('code')}</Label></TableColumn>
        <TableColumn><Label>{t('description')}</Label></TableColumn>
        <TableColumn><Label>{t('quantity')}</Label></TableColumn>
        <TableColumn><Label>{t('delivery')}</Label></TableColumn>
        <TableColumn><Label>{t('showroom')}</Label></TableColumn>
        <TableColumn><Label>{t('inWarehouse')}</Label></TableColumn>
        <TableColumn><Label>{t('stock')}</Label></TableColumn>
      </>}
    >
      {data.map((row) => {
        let inWarehouse = row.quantity - row.delivery - row.showroom;
        return <TableRow style={{cursor: 'pointer'}} onClick={() => onClick(row)} key={row.itemCode}>
          <TableCell className="clickCell">{row.itemCode}</TableCell>
          <TableCell className="clickCell">{row.itemName}</TableCell>
          <TableCell className="clickCell">{formatValueByPack(row.quantity, row.packUnit, displayPackage)}</TableCell>
          <TableCell className="clickCell">{formatValueByPack(row.delivery, row.packUnit, displayPackage)}</TableCell>
          <TableCell className="clickCell">{formatValueByPack(row.showroom, row.packUnit, displayPackage)}</TableCell>
          <TableCell className="clickCell">{formatValueByPack(inWarehouse, row.packUnit, displayPackage)}</TableCell>
          <TableCell className="clickCell">{formatValueByPack(row.stock, row.packUnit, displayPackage)}</TableCell>
        </TableRow>;
      })}
    </Table>;
}

export default GoodsReceiptAllReportTable;