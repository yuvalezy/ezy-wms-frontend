import ContentTheme from "../Components/ContentTheme";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {TextValue} from "../assets/TextValue";
import {useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import ErrorMessage from "../Components/ErrorMessagex";
import {IsNumeric, StringFormat} from "../assets/Functions";
import Box from "@mui/material/Box";
import {Alert, AlertColor, Button, TextField} from "@mui/material";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import BoxConfirmationDialog from '../Components/BoxConfirmationDialog'
import DoneIcon from "@mui/icons-material/Done";
import {addItem, AddItemReturnValue, scanBarcode} from "./GoodsReceiptSupervisor/Document";
import {distinctItems, Item} from "../assets/Common";


export default function GoodsReceiptProcess() {
    const {scanCode} = useParams();
    const barcodeRef = useRef<HTMLInputElement>();
    const [id, setID] = useState<number | null>();
    const [enable, setEnable] = useState(true);
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
            .catch(error => {
                errorAlert(`Scan Bar Code Error: ${error}`);
                setLoading(false);
            })


        setTimeout(() => setSnackbar({open: false}), 5000);
    }

    function handleItems(items: Item[]) {
        if (items.length === 0) {
            alert(StringFormat(TextValue.BarcodeNotFound, barcodeInput), 'DarkRed');
            setBarcodeInput('');
            setLoading(false);
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
            setLoading(false);
            return;
        }
        setBoxItem(distinctCodes[0]);
        setBoxItems(items);
        setOpenBoxDialog(true);
        setLoading(false);
    }

    function addItemToDocument(itemCode: string) {
        setOpenBoxDialog(false);
        const barcode = barcodeInput;
        setBarcodeInput('');
        setLoading(true);
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
                    case AddItemReturnValue.ClosedDocument:
                        message = StringFormat(TextValue.GoodsReceiptIsClosed, id);
                        color = 'error';
                        break;
                    default:
                        message = `Unknown return value: ${v}`;
                        color = 'error';
                        break;
                }
                setAlertMessage(message);
                setAlertColor(color);
                if (v !== AddItemReturnValue.ClosedDocument) {
                    setTimeout(() => setAlertMessage(''), 5000);
                } else {
                    setEnable(false);
                }
            })
            .catch(error => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data['exceptionMessage'];
                if (errorMessage)
                    errorAlert(errorMessage);
                else
                    errorAlert(`Add Item Error: ${error}`);
            })
            .finally(function () {
                setLoading(false);
                setTimeout(() => barcodeRef.current?.focus(), 100);
            })
    }

    function BarCodeForm(): React.ReactNode {
        return (
            <form onSubmit={handleSubmit}>
                {enable && (
                    <>
                        <Box mb={1} style={{textAlign: 'center'}}>
                            <TextField
                                fullWidth
                                required
                                label={TextValue.Barcode}
                                variant="outlined"
                                value={barcodeInput}
                                onChange={e => setBarcodeInput(e.target.value)}
                                autoFocus={true}
                                inputRef={barcodeRef}
                                disabled={!enable}
                            />
                            <Box mt={1}>
                                <Button type="submit" variant="contained" color="primary" disabled={!enable}>
                                    <DoneIcon/>
                                    {TextValue.Accept}
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
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

