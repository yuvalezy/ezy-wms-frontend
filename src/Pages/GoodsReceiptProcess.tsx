import ContentTheme from "../Components/ContentTheme";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {TextValue} from "../assets/TextValue";
import {useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import ErrorMessage from "../Components/ErrorMessagex";
import {IsNumeric, StringFormat} from "../assets/Functions";
import Box from "@mui/material/Box";
import {Button, TextField} from "@mui/material";
import BoxConfirmationDialog from '../Components/BoxConfirmationDialog'
import DoneIcon from "@mui/icons-material/Done";
import {scanBarcode} from "./GoodsReceiptSupervisor/Document";
import {distinctItems, Item} from "../assets/Common";
import ProcessAlert, {AlertActionType, ProcessAlertValue} from "./GoodsReceiptProcess/ProcessAlert";
import ProcessComment from "./GoodsReceiptProcess/ProcessComment";
import {useLoading} from "../Components/LoadingContext";
import ProcessCancel from "./GoodsReceiptProcess/ProcessCancel";
import {addItem} from "./GoodsReceiptProcess/Process";
import ProcessNumInBuy from "./GoodsReceiptProcess/ProcessNumInBuy";


export default function GoodsReceiptProcess() {
    const {scanCode} = useParams();
    const barcodeRef = useRef<HTMLInputElement>();
    const [id, setID] = useState<number | null>();
    const [enable, setEnable] = useState(true);
    const {setLoading} = useLoading();
    const [barcodeInput, setBarcodeInput] = React.useState('');
    const [openBoxDialog, setOpenBoxDialog] = useState(false);
    const [boxItem, setBoxItem] = useState('');
    const [boxItems, setBoxItems] = useState<Item[]>();
    const [acceptValues, setAcceptValues] = useState<ProcessAlertValue[]>([]);
    const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
    const [currentAlertAction, setCurrentAlertAction] = useState<AlertActionType>(AlertActionType.None);

    const title = `${TextValue.GoodsReceipt} #${scanCode}`;

    useEffect(() => {
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        setID(parseInt(scanCode));
    }, []);

    const alert = (alert: ProcessAlertValue) => {
        let date = new Date(Date.now());
        alert.timeStamp = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        setAcceptValues([alert, ...acceptValues]);
    };


    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (barcodeInput.length === 0) {
            window.alert(TextValue.BarcodeRequired);
            return;
        }

        setLoading(true);
        scanBarcode(barcodeInput)
            .then(items => handleItems(items))
            .catch(error => {
                alert({message: `Scan Bar Code Error: ${error}`, severity: 'error'});
                setLoading(false);
            })
    }

    function handleItems(items: Item[]) {
        if (items.length === 0) {
            alert({barcode: barcodeInput, message: StringFormat(TextValue.BarcodeNotFound, barcodeInput), severity: 'error'});
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
            alert({message: StringFormat(TextValue.MultipleItemsError, codes), severity: 'error'});
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
                alert({
                    lineID: v.response.lineID,
                    barcode: barcode,
                    itemCode: itemCode,
                    message: v.message,
                    severity: v.color,
                    multiple: v.multiple,
                    numInBuy: v.response.numInBuy
                });
                if (v.response.closedDocument) {
                    setEnable(false);
                }
            })
            .catch(error => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data['exceptionMessage'];
                if (errorMessage)
                    alert({barcode: barcode, itemCode: itemCode, message: errorMessage, severity: 'error'});
                else
                    alert({barcode: barcode, itemCode: itemCode, message: `Add Item Error: ${error}`, severity: 'error'});
            })
            .finally(function () {
                setLoading(false);
                setTimeout(() => barcodeRef.current?.focus(), 100);
            })
    }


    function alertAction(alert: ProcessAlertValue, type: AlertActionType) {
        setCurrentAlert(alert);
        setCurrentAlertAction(type);
    }

    function handleAlertActionAccept(newAlert: ProcessAlertValue): void {
        if (currentAlert == null) {
            return;
        }
        let index = acceptValues.findIndex(v => v.lineID === currentAlert.lineID);
        let newAcceptValues = acceptValues.filter(v => v.lineID !== currentAlert.lineID);
        newAcceptValues.splice(index, 0, newAlert);
        setAcceptValues(newAcceptValues);
        setCurrentAlert(null);
        setCurrentAlertAction(AlertActionType.None);
    }

    function handleAlertCancelAction() {
        setCurrentAlert(null);
        setCurrentAlertAction(AlertActionType.None);
    }

    return (
        <ContentTheme title={title} icon={<AssignmentTurnedInIcon/>}>
            {id ? (
                <>
                    {enable && (
                        <form onSubmit={handleSubmit}>
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
                            <BoxConfirmationDialog
                                open={openBoxDialog}
                                onClose={() => setOpenBoxDialog(false)}
                                onSelected={(v: string) => addItemToDocument(v)}
                                itemCode={boxItem}
                                items={boxItems}
                            />
                        </form>
                    )}
                    <>
                        {acceptValues.map(alert => <ProcessAlert alert={alert} onAction={(type) => alertAction(alert, type)}/>)}
                        {currentAlert && (
                            <>
                                {currentAlertAction === AlertActionType.Comments && (
                                    <ProcessComment
                                        id={id}
                                        alert={currentAlert}
                                        onAccept={handleAlertActionAccept}
                                        onClose={handleAlertCancelAction}
                                    />
                                )}
                                {currentAlertAction === AlertActionType.Cancel && (
                                    <ProcessCancel
                                        id={id}
                                        alert={currentAlert}
                                        onAccept={handleAlertActionAccept}
                                        onClose={handleAlertCancelAction}
                                    />
                                )}
                                {currentAlertAction}
                                {currentAlertAction === AlertActionType.NumInBuy && (
                                    <ProcessNumInBuy
                                        id={id}
                                        alert={currentAlert}
                                        onAccept={handleAlertActionAccept}
                                        onClose={handleAlertCancelAction}
                                    />
                                )}
                            </>
                        )}

                    </>
                </>
            ) : <ErrorMessage text={TextValue.InvalidScanCode}/>
            }
        </ContentTheme>
    )

}

