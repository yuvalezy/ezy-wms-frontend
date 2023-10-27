import {Alert, AlertTitle, Button, Paper, Table, TableBody, TableHead} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Box from "@mui/material/Box";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import React from "react";
import {ItemCheckResponse} from "./Item";

interface ItemCheckMultipleResultProps {
    barcode: string;
    result: ItemCheckResponse[];
    clear: () => void;
    setBarcodeItem: (index: number) => void;
}

const ItemCheckMultipleResult: React.FC<ItemCheckMultipleResultProps> = ({barcode, result, clear, setBarcodeItem}) => {
    return (
        <>
            <Alert variant="filled" severity="warning">
                <AlertTitle>
                    {TextValue.MultipleItemsDetected}
                </AlertTitle>
                {TextValue.Barcode}: {barcode}
            </Alert>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{TextValue.Item}</TableCell>
                            <TableCell>{TextValue.Description}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            result.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.itemCode}</TableCell>
                                    <TableCell>{item.itemName}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="warning" onClick={() => setBarcodeItem(index)}>{TextValue.Select}</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <br/>
            <Box mb={1} style={{textAlign: 'center'}}>
                <Button type="button" variant="contained" color="info" onClick={() => clear()}>
                    <HighlightOffIcon/>
                    {TextValue.Clear}
                </Button>
            </Box>
        </>
    )
}
export default ItemCheckMultipleResult;