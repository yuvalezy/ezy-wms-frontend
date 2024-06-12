import * as React from 'react';
import {CountingSummaryReportLine} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Label, Table, TableCell, TableColumn, TableRow} from '@ui5/webcomponents-react';

interface CountingSummaryReportTableProps {
    data: CountingSummaryReportLine[]
}

const CountingSummaryReportTable: React.FC<CountingSummaryReportTableProps> = ({data}) => {
    const {t} = useTranslation();

    return (
        <Table
            columns={<>
                <TableColumn><Label>{t('bin')}</Label></TableColumn>
                <TableColumn><Label>{t('code')}</Label></TableColumn>
                <TableColumn><Label>{t('description')}</Label></TableColumn>
                <TableColumn><Label>{t('quantity')}</Label></TableColumn>
            </>}
        >
            {data.map((row) => (
                <TableRow key={row.itemCode + row.binCode}>
                    <TableCell><Label>{row.binCode}</Label></TableCell>
                    <TableCell><Label>{row.itemCode}</Label></TableCell>
                    <TableCell><Label>{row.itemName}</Label></TableCell>
                    <TableCell><Label>{row.quantity}</Label></TableCell>
                </TableRow>
            ))}
        </Table>
    );
}

export default CountingSummaryReportTable;