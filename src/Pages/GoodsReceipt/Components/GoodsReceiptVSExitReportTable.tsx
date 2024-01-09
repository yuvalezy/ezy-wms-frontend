import * as React from 'react';
import {GoodsReceiptVSExitReportDataLine} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Label, Table, TableCell, TableColumn, TableRow} from '@ui5/webcomponents-react';

interface GoodsReceiptVSExitReportTableProps {
    data: GoodsReceiptVSExitReportDataLine[]
}

const GoodsReceiptVSExitReportTable: React.FC<GoodsReceiptVSExitReportTableProps> = ({data}) => {
    const {t} = useTranslation();

    return (
        <Table
            columns={<>
                <TableColumn><Label>{t('code')}</Label></TableColumn>
                <TableColumn><Label>{t('description')}</Label></TableColumn>
                <TableColumn><Label>{t('openQuantity')}</Label></TableColumn>
                <TableColumn><Label>{t('Quantity')}</Label></TableColumn>
            </>}
        >
            {data.map((row) => (
                <TableRow key={row.itemCode}>
                    <TableCell><Label>{row.itemCode}</Label></TableCell>
                    <TableCell><Label>{row.itemName}</Label></TableCell>
                    <TableCell><Label>{row.openQuantity}</Label></TableCell>
                    <TableCell><Label>{row.quantity}</Label></TableCell>
                </TableRow>
            ))}
        </Table>
    );
}

export default GoodsReceiptVSExitReportTable;