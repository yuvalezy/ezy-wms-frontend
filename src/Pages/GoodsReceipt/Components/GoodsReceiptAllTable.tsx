import * as React from 'react';
import {GoodsReceiptAll} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Label, Table, TableCell, TableColumn, TableRow} from '@ui5/webcomponents-react';

interface GoodsReceiptAllTableProps {
    data: GoodsReceiptAll[]
    onClick: (data: GoodsReceiptAll) => void;
}

const GoodsReceiptAllReportTable: React.FC<GoodsReceiptAllTableProps> = ({data, onClick}) => {
    const {t} = useTranslation();

    return (
        <Table
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
            {data.map((row) => (
                <TableRow style={{cursor: 'pointer'}} onClick={() => onClick(row)} key={row.itemCode}>
                    <TableCell className="clickCell">{row.itemCode}</TableCell>
                    <TableCell className="clickCell">{row.itemName}</TableCell>
                    <TableCell className="clickCell">{row.quantity}</TableCell>
                    <TableCell className="clickCell">{row.delivery}</TableCell>
                    <TableCell className="clickCell">{row.showroom}</TableCell>
                    <TableCell className="clickCell">{row.quantity - row.delivery - row.showroom}</TableCell>
                    <TableCell className="clickCell">{row.stock}</TableCell>
                </TableRow>
            ))}
        </Table>
    );
}

export default GoodsReceiptAllReportTable;