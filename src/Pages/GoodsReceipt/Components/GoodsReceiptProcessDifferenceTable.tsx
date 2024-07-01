import * as React from 'react';
import {
    GoodsReceiptValidateProcessLine,
    GoodsReceiptValidateProcessLineStatus,
} from "../Data/Report";
import {useTranslation} from "react-i18next";
import {Label, Table, TableCell, TableColumn, TableRow} from '@ui5/webcomponents-react';
import {CSSProperties} from "react";


interface GoodsReceiptProcessDifferenceTableProps {
    data: GoodsReceiptValidateProcessLine[]
}

const GoodsReceiptProcessDifferenceTable: React.FC<GoodsReceiptProcessDifferenceTableProps> = ({data}) => {
    const {t} = useTranslation();

    const getRowStyle = (status: GoodsReceiptValidateProcessLineStatus) : CSSProperties => {
        switch (status) {
            case GoodsReceiptValidateProcessLineStatus.OK:
                return { backgroundColor: '#d4edda' }; // Green
            case GoodsReceiptValidateProcessLineStatus.LessScan:
                return { backgroundColor: '#f8d7da' }; // Red
            case GoodsReceiptValidateProcessLineStatus.MoreScan:
                return { backgroundColor: '#fff3cd' }; // Yellow
            case GoodsReceiptValidateProcessLineStatus.ClosedLine:
                return { backgroundColor: '#d1ecf1' }; // Light Blue
            default:
                return {};
        }
    };

    function getRowStatusLabel(status: GoodsReceiptValidateProcessLineStatus) {
        switch (status) {
            case GoodsReceiptValidateProcessLineStatus.OK:
                return t("complete");
            case GoodsReceiptValidateProcessLineStatus.LessScan:
                return t("lessThenOrdered");
            case GoodsReceiptValidateProcessLineStatus.MoreScan:
                return t("moreThenOrdered");
            case GoodsReceiptValidateProcessLineStatus.ClosedLine:
                return t("closed");
            default:
                return '';
        }
    }

    return (
        <Table
            columns={<>
                <TableColumn><Label>#</Label></TableColumn>
                <TableColumn><Label>{t('code')}</Label></TableColumn>
                <TableColumn><Label>{t('description')}</Label></TableColumn>
                <TableColumn><Label>{t('scannedQuantity')}</Label></TableColumn>
                <TableColumn><Label>{t('documentQuantity')}</Label></TableColumn>
                <TableColumn><Label>{t('status')}</Label></TableColumn>
            </>}
        >
            {data.map((row) => (
                <>
                    <TableRow key={row.lineNumber}>
                        <TableCell style={getRowStyle(row.lineStatus)}><Label>{row.lineNumber}</Label></TableCell>
                        <TableCell style={getRowStyle(row.lineStatus)}><Label>{row.itemCode}</Label></TableCell>
                        <TableCell style={getRowStyle(row.lineStatus)}><Label>{row.itemName}</Label></TableCell>
                        <TableCell style={getRowStyle(row.lineStatus)}><Label>{row.quantity}</Label></TableCell>
                        <TableCell style={getRowStyle(row.lineStatus)}><Label>{row.openInvQty}</Label></TableCell>
                        <TableCell style={getRowStyle(row.lineStatus)}><Label>{getRowStatusLabel(row.lineStatus)}</Label></TableCell>
                    </TableRow>
                </>
            ))}
        </Table>
    );
}

export default GoodsReceiptProcessDifferenceTable;