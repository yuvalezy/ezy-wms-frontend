import ContentTheme from "../Components/ContentTheme";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {TextValue} from "../assets/TextValue";
import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import ErrorMessage from "../Components/ErrorMessagex";
import {IsNumeric, StringFormat} from "../assets/Functions";
import Box from "@mui/material/Box";
import {Alert, AlertColor, Button, makeStyles, TextField} from "@mui/material";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import BoxConfirmationDialog from '../Components/BoxConfirmationDialog'
import DoneIcon from "@mui/icons-material/Done";
import {addItem, AddItemReturnValue, scanBarcode} from "./GoodsReceiptSupervisor/Document";
import {distinctItems, Item} from "../assets/Common";


export default function GoodsReceiptProcess() {
    const {scanCode} = useParams();
    const [id, setID] = useState<number | null>();
    const [loading, setLoading] = useState(false);
    const [barcodeInput, setBarcodeInput] = React.useState('');
    const [snackbar, setSnackbar] = React.useState<SnackbarState>({open: false});
    const [alertMessage, setAlertMessage] = React.useState('');
    const [alertColor, setAlertColor] = React.useState<AlertColor>();
    const [openBoxDialog, setOpenBoxDialog] = useState(false);
    const [boxItem, setBoxItem] = useState('');
    const [boxItems, setBoxItems] = useState<Item[]>();

    const title = `${TextValue.GoodsReceipt} #${scanCode}`;

    useEffect(() => {
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        setID(parseInt(scanCode));
    }, []);

    const alert = (message: string, color: string) => {
        setSnackbar({open: true, message: message, color: color});
        setTimeout(() => setSnackbar({open: false}), 5000);
    };

    const errorAlert = (message: string) => {
        setSnackbar({open: true, message: message, color: 'red'});
        setTimeout(() => setSnackbar({open: false}), 5000);
    };


    return (
        <ContentTheme loading={loading} title={title} icon={<AssignmentTurnedInIcon/>}>
            {id ? (
                BarCodeForm()
            ) : <ErrorMessage text={TextValue.InvalidScanCode}/>
            }
        </ContentTheme>
    )

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (barcodeInput.length === 0) {
            alert(TextValue.BarcodeRequired, 'DarkRed');
            return;
        }

        setLoading(true);
        scanBarcode(barcodeInput)
            .then(items => handleItems(items))
            .catch(error => errorAlert(`Scan Bar Code Error: ${error}`))
            .finally(() => setLoading(false));


        setTimeout(() => setSnackbar({open: false}), 5000);
    }

    function handleItems(items: Item[]) {
        if (items.length === 0) {
            alert(StringFormat(TextValue.BarcodeNotFound, barcodeInput), 'DarkRed');
            setBarcodeInput('');
            return;
        }
        if (items.length === 1) {
            addItemToDocument(items[0].code);
            return;
        }
        handleMultipleItems(items);
    }

    function handleMultipleItems(items: Item[]) {
        const distinctCodes = distinctItems(items);
        if (distinctCodes.length !== 1) {
            let codes = distinctCodes.map(v => `"${v}"`).join('\n');
            alert(StringFormat(TextValue.MultipleItemsError, codes), 'DarkRed');
            return;
        }
        setBoxItem(distinctCodes[0]);
        setBoxItems(items);
        setOpenBoxDialog(true);
    }

    function addItemToDocument(itemCode: string) {
        setOpenBoxDialog(false);
        const barcode = barcodeInput;
        setBarcodeInput('');
        addItem(id ?? 0, itemCode, barcode)
            .then(v => {
                let message: string;
                let color: AlertColor;
                switch (v) {
                    case AddItemReturnValue.StoreInWarehouse:
                        message = TextValue.ScanConfirmStoreInWarehouse;
                        color = 'success';
                        break;
                    case AddItemReturnValue.Fulfillment:
                        message = TextValue.ScanConfirmFulfillment;
                        color = 'warning';
                        break;
                    case AddItemReturnValue.Showroom:
                        message = TextValue.ScanConfirmShowroom;
                        color = 'info';
                        break;
                    default:
                        message = `Unkowon return value: ${v}`;
                        color = 'error';
                        break;
                }
                setAlertMessage(message);
                setAlertColor(color);
                setTimeout(() => setAlertMessage(''), 5000);
            })
            .catch(error => errorAlert(`Add Item Error: ${error}`))
            .finally(() => setLoading(false))
    }

    function BarCodeForm(): React.ReactNode {
        return (
            <form onSubmit={handleSubmit}>
                <Box mb={1} style={{textAlign: 'center'}}>
                    <TextField
                        fullWidth
                        required
                        label={TextValue.Barcode}
                        variant="outlined"
                        value={barcodeInput}
                        onChange={e => setBarcodeInput(e.target.value)}
                        autoFocus={true}
                    />
                    <Box mt={1}>
                        <Button type="submit" variant="contained" color="primary">
                            <DoneIcon/>
                            {TextValue.Accept}
                        </Button>
                    </Box>
                </Box>
                {alertMessage &&
                    <Box mt={1}>
                        <Alert variant="filled" severity={alertColor}>
                            {alertMessage}
                        </Alert>
                    </Box>
                }
                <BoxConfirmationDialog
                    open={openBoxDialog}
                    onClose={() => setOpenBoxDialog(false)}
                    onSelected={(v: string) => addItemToDocument(v)}
                    itemCode={boxItem}
                    items={boxItems}
                />
                <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
            </form>
        )
    }
}

