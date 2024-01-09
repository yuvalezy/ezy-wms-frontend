import * as React from 'react';
import {GoodsReceiptAll} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Label, Table, TableCell, TableColumn, TableRow} from '@ui5/webcomponents-react';

interface GoodsReceiptAllTableProps {
    data: GoodsReceiptAll[]
}

const GoodsReceiptAllReportTable: React.FC<GoodsReceiptAllTableProps> = ({data}) => {
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
                <TableRow key={row.itemCode}>
                    <TableCell><Label>{row.itemCode}</Label></TableCell>
                    <TableCell><Label>{row.itemName}</Label></TableCell>
                    <TableCell><Label>{row.quantity}</Label></TableCell>
                    <TableCell><Label>{row.delivery}</Label></TableCell>
                    <TableCell><Label>{row.showroom}</Label></TableCell>
                    <TableCell><Label>{row.quantity - row.delivery - row.showroom}</Label></TableCell>
                    <TableCell><Label>{row.stock}</Label></TableCell>
                </TableRow>
            ))}
        </Table>
    );
}

export default GoodsReceiptAllReportTable;