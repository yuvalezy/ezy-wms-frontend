import {Button, Card, CardContent, Checkbox, Grid, Paper, Table, TableBody, TableFooter, TableHead, TextField, Typography} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Box from "@mui/material/Box";
import SaveIcon from "@mui/icons-material/Save";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import React from "react";
import {ItemCheckResponse} from "./Item";
import {useTranslation} from "react-i18next";

interface ItemCheckResultProps {
     result: ItemCheckResponse;
     clear: () => void;
     submit: (checkedBarcodes: string[], newBarcode: string) => void;
}
const ItemCheckResult : React.FC<ItemCheckResultProps> = ({result, clear, submit}) => {
    const {t} = useTranslation();
    const [checkedBarcodes, setCheckedBarcodes] = React.useState<string[]>([]);
    const [newBarcodeInput, setNewBarcodeInput] = React.useState('');

    function handleCheckboxChange(barcode: string, isChecked: boolean) {
        if (isChecked) {
            setCheckedBarcodes(prev => [...prev, barcode]);
        } else {
            setCheckedBarcodes(prev => prev.filter(bc => bc !== barcode));
        }
    }
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        submit(checkedBarcodes, newBarcodeInput);
        setCheckedBarcodes([]);
        setNewBarcodeInput('');
    }

    return (
        <form onSubmit={handleSubmit}>
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6">{t('Code')}: {result.itemCode}</Typography>
                <Typography color="textSecondary">{t('Description')}: {result.itemName}</Typography>
                <Typography color="textSecondary">{t('NumInBuy')}: {result.numInBuy}</Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('Delete')}</TableCell>
                                <TableCell>{t('Barcode')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                result?.barcodes?.map((barcode, index) =>
                                    (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={checkedBarcodes.includes(barcode)}
                                                    onChange={(e) => handleCheckboxChange(barcode, e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>{barcode}</TableCell>
                                        </TableRow>
                                    )
                                )
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>
                                    <TextField inputProps={{maxLength: 254}} size="small" placeholder="New Barcode" value={newBarcodeInput}
                                               onChange={(e) => setNewBarcodeInput(e.target.value)}/>
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </CardContent>
            <Box mb={1} style={{textAlign: 'center'}}>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={6}>
                        <Button type="submit" variant="contained" color="warning">
                            <SaveIcon/>
                            {t('Update')}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button type="button" variant="contained" color="info" onClick={() => clear()}>
                            <HighlightOffIcon/>
                            {t('Clear')}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Card>
        </form>
    )
}

export default ItemCheckResult;