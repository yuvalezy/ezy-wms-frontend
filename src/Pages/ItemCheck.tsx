import ContentTheme from "../Components/ContentTheme";
import {TextValue} from "../assets/TextValue";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import SaveIcon from '@mui/icons-material/Save';
import Box from "@mui/material/Box";
import {Alert, AlertTitle, Button, Card, CardContent, Checkbox, Grid, Paper, Radio, Table, TableBody, TableFooter, TableHead, TextField, Typography} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import React, {useRef} from "react";
import {useLoading} from "../Components/LoadingContext";
import {itemCheck, ItemCheckResponse, updateItemBarCode} from "./ItemCheck/Item";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import {ResponseStatus} from "../assets/Common";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {StringFormat} from "../assets/Functions";

export default function ItemCheck() {
    const [barcodeInput, setBarcodeInput] = React.useState('');
    const [itemCodeInput, setItemCodeInput] = React.useState('');
    const [result, setResult] = React.useState<ItemCheckResponse[] | null>(null);
    const {setLoading} = useLoading();
    const barcodeRef = useRef<HTMLInputElement>();
    const itemCodeRef = useRef<HTMLInputElement>();
    const [checkedBarcodes, setCheckedBarcodes] = React.useState<string[]>([]);
    const [newBarcodeInput, setNewBarcodeInput] = React.useState('');


    function handleCheckSubmit(e: React.FormEvent) {
        e.preventDefault();
        let barcodeLength = barcodeInput.length === 0;
        let itemCodeLength = itemCodeInput.length === 0;
        if (barcodeLength && itemCodeLength) {
            window.alert(TextValue.BarcodeOrItemRequired);
            return;
        }

        setLoading(true);
        executeItemCheck(itemCodeInput, barcodeInput);
    }

    function executeItemCheck(itemCode: string, barCode: string) {
        itemCheck(itemCode, barCode)
            .then(function (items) {
                setResult(items);
            })
            .catch(error => window.alert({message: `Item Check Error: ${error}`, severity: 'error'}))
            .finally(() => setLoading(false));
    }

    function handleCheckboxChange(barcode: string, isChecked: boolean) {
        if (isChecked) {
            setCheckedBarcodes(prev => [...prev, barcode]);
        } else {
            setCheckedBarcodes(prev => prev.filter(bc => bc !== barcode));
        }
    }

    function handleUpdateSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (result?.length !== 1) {
            return;
        }
        setLoading(true);
        executeUpdateItemBarcode(result[0].itemCode);
    }

    function executeUpdateItemBarcode(itemCode: string) {
        updateItemBarCode(itemCode, checkedBarcodes, newBarcodeInput)
            .then((response) => {
                if (response.status === ResponseStatus.Ok) {
                    executeItemCheck(itemCode, '');
                } else {
                    if (response.existItem != null) {
                        window.alert(`Barcode ${newBarcodeInput} already exists for item ${response.existItem}`);
                    } else {
                        window.alert(response.errorMessage ?? 'Unknown error');
                    }
                    setLoading(false);
                }
            })
            .catch(error => {
                window.alert(`Item Check Error: ${error}`);
                setLoading(false);
            })
            .finally(function () {
                setNewBarcodeInput('');
                setCheckedBarcodes([])
            })
    }

    async function handleSetBarcodeItem(index: number) {
        if (result == null)
            return;
        let itemCode: string = result[index].itemCode;
        if (!window.confirm(StringFormat(TextValue.ConfirmItemBarCode, itemCode, barcodeInput))) {
            return;
        }
        setLoading(true);
        for (let i = 0; i < result.length; i++) {
            if (i === index) {
                continue;
            }
            await updateItemBarCode(result[i].itemCode, [barcodeInput], '');
        }
        executeItemCheck(itemCode, '');
    }

    function clear() {
        setItemCodeInput('');
        setBarcodeInput('');
        setResult(null);
    }


    return (
        <ContentTheme title={TextValue.ItemCheck} icon={<CheckBoxIcon/>}>
            {
                result == null &&
                <form onSubmit={handleCheckSubmit}>
                    <>
                        <Box mb={1} style={{textAlign: 'center'}}>
                            <TextField
                                fullWidth
                                required={itemCodeInput.length === 0}
                                disabled={itemCodeInput.length > 0}
                                label={TextValue.Barcode}
                                variant="outlined"
                                value={barcodeInput}
                                inputRef={barcodeRef}
                                onChange={e => setBarcodeInput(e.target.value)}
                                autoFocus={true}
                            />
                        </Box>
                        <Box mb={1} style={{textAlign: 'center'}}>
                            <TextField
                                fullWidth
                                required={barcodeInput.length === 0}
                                disabled={barcodeInput.length > 0}
                                label={TextValue.Code}
                                variant="outlined"
                                value={itemCodeInput}
                                inputRef={itemCodeRef}
                                onChange={e => setItemCodeInput(e.target.value)}
                            />
                            <Box mt={1}>
                                <Button type="submit" variant="contained" color="primary">
                                    <DoneIcon/>
                                    {TextValue.Accept}
                                </Button>
                            </Box>
                        </Box>
                    </>
                </form>
            }
            {
                result &&
                <form onSubmit={handleUpdateSubmit}>
                    {result.length === 0 &&
                        <Alert variant="filled" severity="error">
                            {TextValue.NoDataFound}
                        </Alert>
                    }
                    {
                        result.length === 1 &&
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6">{TextValue.Code}: {result[0].itemCode}</Typography>
                                <Typography color="textSecondary">{TextValue.Description}: {result[0].itemName}</Typography>
                                <Typography color="textSecondary">{TextValue.NumInBuy}: {result[0].numInBuy}</Typography>
                                <TableContainer component={Paper}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{TextValue.Delete}</TableCell>
                                                <TableCell>{TextValue.Barcode}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                result[0]?.barcodes?.map((barcode, index) =>
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
                            <Box mb={1} style={{ textAlign: 'center' }}>
                                <Grid container spacing={3} justifyContent="center">
                                    <Grid item xs={6}>
                                        <Button type="submit" variant="contained" color="warning">
                                            <SaveIcon />
                                            {TextValue.Update}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button type="button" variant="contained" color="info" onClick={() => clear()}>
                                            <HighlightOffIcon />
                                            {TextValue.Clear}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Card>
                    }
                    {result.length > 1 &&
                        <>
                            <Alert variant="filled" severity="warning">
                                <AlertTitle>
                                    {TextValue.MultipleItemsDetected}
                                </AlertTitle>
                                {TextValue.Barcode}: {result[0].barcodes[0]}
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
                                                        <Button variant="contained" color="warning" onClick={() => handleSetBarcodeItem(index)}>{TextValue.Select}</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <br/>
                            <Box mb={1} style={{ textAlign: 'center' }}>
                                <Button type="button" variant="contained" color="info" onClick={() => clear()}>
                                    <HighlightOffIcon />
                                    {TextValue.Clear}
                                </Button>
                            </Box>
                        </>

                    }
                </form>
            }
        </ContentTheme>
    )
}