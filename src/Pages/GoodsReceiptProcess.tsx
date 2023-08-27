import ContentTheme from "../Components/ContentTheme";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {TextValue} from "../assets/TextValue";
import {useParams} from "react-router-dom";
import React from "react";
import ErrorMessage from "../Components/ErrorMessagex";
import { IsNumeric} from "../assets/Functions";
import Box from "@mui/material/Box";
import {Button, TextField} from "@mui/material";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import DoneIcon from "@mui/icons-material/Done";

export default function GoodsReceiptProcess() {
    const {scanCode} = useParams();
    const [barcodeInput, setBarcodeInput] = React.useState('1234');
    //todo remove default state
    const [snackbar, setSnackbar] = React.useState<SnackbarState>({
        open: false,
        message: '',
        color: ''
    });

    const title = `${TextValue.GoodsReceipt} #${scanCode}`;

    function isValid() {
        if (scanCode === null || scanCode === undefined)
            return false;
        return IsNumeric(scanCode);
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
                setSnackbar({
                    open: true,
                    message: TextValue.ScanConfirmStoreInWarehouse,
                    color: 'Green'
                });
                break;
            case 2:
                setSnackbar({
                    open: true,
                    message: TextValue.ScanConfirmFulfillment,
                    color: 'Amber'
                });
                break;
            case 3:
                setSnackbar({
                    open: true,
                    message: TextValue.ScanConfirmShowroom,
                    color: 'Blue'
                });
                break;
            case 4:
                setSnackbar({
                    open: true,
                    message: TextValue.ScanConfirmBoxNumber,
                    color: 'Purple'
                });
                break;
            case 5:
                setSnackbar({
                    open: true,
                    message: TextValue.ScanConfirmSupervisor,
                    color: 'DarkRed'
                });
                break;
            default:
                setSnackbar({
                    open: true,
                    message: TextValue.Unknown,
                    color: 'DarkRed'
                });
                break;
        }

        setTimeout(() => setSnackbar({open: false}), 5000);
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
                    <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
                </Box>
            </form>
        )
    }
}

