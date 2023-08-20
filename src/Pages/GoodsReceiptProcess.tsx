import ContentTheme from "../Components/ContentTheme";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {TextValue} from "../assets/TextValue";
import {useParams} from "react-router-dom";
import React from "react";
import ErrorMessage from "../Components/ErrorMessagex";
import {Functions} from "../assets/Functions";
import Box from "@mui/material/Box";
import {Button, TextField, Snackbar, Slide, IconButton, SnackbarProps} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import ConfirmationSnackbar from "../Components/ConfirmationSnackbar";

export default function GoodsReceiptProcess() {
    const {scanCode} = useParams();
    const [barcodeInput, setBarcodeInput] = React.useState('1234');
    //todo remove default state
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarColor, setSnackbarColor] = React.useState('');

    const title = `${TextValue.GoodsReceipt} #${scanCode}`;

    function isValid() {
        if (scanCode === null || scanCode === undefined)
            return false;
        return Functions.IsNumeric(scanCode);
    }


    return (
        <ContentTheme title={title} icon={<AssignmentTurnedInIcon/>}>
            {isValid() ? (
                BarCodeForm()
            ) : <ErrorMessage text={TextValue.InvalidScanCode}/>
            }
        </ContentTheme>
    )

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (barcodeInput.length === 0) {
            alert(TextValue.BarcodeRequired);
            return;
        }
        //show mock where to put stuff

        let status = 1;
        switch (status) {
            case 1:
                setSnackbarColor('Green');
                setSnackbarMessage(TextValue.ScanConfirmStoreInWarehouse);
                break;
            case 2:
                setSnackbarColor('Amber');
                setSnackbarMessage(TextValue.ScanConfirmFulfillment);
                break;
            case 3:
                setSnackbarColor('Blue');
                setSnackbarMessage(TextValue.ScanConfirmShowroom);
                break;
            case 4:
                setSnackbarColor('Purple');
                setSnackbarMessage(TextValue.ScanConfirmSupervisor);
                break;
            default:
                setSnackbarColor('DarkRed');
                setSnackbarMessage(TextValue.Unknown);
                break;
        }

        setSnackbarOpen(true);
        setTimeout(() => setSnackbarOpen(false), 5000);
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
                    <ConfirmationSnackbar open={snackbarOpen} message={snackbarMessage} color={snackbarColor}
                                          onClose={() => setSnackbarOpen(false)}/>
                </Box>
            </form>
        )
    }
}

