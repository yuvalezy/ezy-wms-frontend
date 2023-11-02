import * as React from 'react';
import {styled} from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {GoodsReceiptVSExitReportDataLine} from "./Report";
import {useTranslation} from "react-i18next";

interface GoodsReceiptVSExitReportTableProps {
    data: GoodsReceiptVSExitReportDataLine[]
}

const GoodsReceiptVSExitReportTable: React.FC<GoodsReceiptVSExitReportTableProps> = ({data}) => {
    const {t} = useTranslation();
    const StyledTableCell = styled(TableCell)(({theme}) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: '#0e4a8f',
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({theme}) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: '#e3f2fd',
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}} size="small">
                <TableHead>
                    <StyledTableRow>
                        <StyledTableCell>{t('code')}</StyledTableCell>
                        <StyledTableCell>{t('description')}</StyledTableCell>
                        <StyledTableCell align="right">{t('openQuantity')}</StyledTableCell>
                        <StyledTableCell align="right">{t('Quantity')}</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody>
                    <>
                        {data.map((row) => (
                            <StyledTableRow
                                key={row.itemCode}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <StyledTableCell component="th" scope="row">
                                    {row.itemCode}
                                </StyledTableCell>
                                <StyledTableCell>{row.itemName}</StyledTableCell>
                                <StyledTableCell align="right">{row.openQuantity}</StyledTableCell>
                                <StyledTableCell align="right">{row.quantity}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </>
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default GoodsReceiptVSExitReportTable;