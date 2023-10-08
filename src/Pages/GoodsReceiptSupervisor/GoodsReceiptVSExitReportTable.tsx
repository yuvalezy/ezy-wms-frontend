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
import {TextValue} from "../../assets/TextValue";

interface GoodsReceiptVSExitReportTableProps {
    data: GoodsReceiptVSExitReportDataLine[]
}

const GoodsReceiptVSExitReportTable: React.FC<GoodsReceiptVSExitReportTableProps> = ({data}) => {
    const StyledTableCell = styled(TableCell)(({theme}) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({theme}) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
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
                        <StyledTableCell>{TextValue.Code}</StyledTableCell>
                        <StyledTableCell>{TextValue.Description}</StyledTableCell>
                        <StyledTableCell align="right">{TextValue.OpenQuantity}</StyledTableCell>
                        <StyledTableCell align="right">{TextValue.Quantity}</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody>
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
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default GoodsReceiptVSExitReportTable;