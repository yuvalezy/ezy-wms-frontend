import React, {useState} from "react";
import Box from "@mui/material/Box";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import {TextValue} from "../assets/TextValue";
import {Button, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import {useNavigate} from "react-router-dom";
import ContentTheme from "../Components/ContentTheme";
import {IsNumeric, StringFormat} from "../assets/Functions";
import SnackbarAlert, {SnackbarState} from "../Components/SnackbarAlert";
import {DocumentStatus, documentStatusToString, fetchDocuments} from "./GoodsReceiptSupervisor/Document";

export default function GoodsReceipt() {
    const [, setLoading] = useState(false);
    const [scanCodeInput, setScanCodeInput] = React.useState('');
    const [snackbar, setSnackbar] = React.useState<SnackbarState>({open: false});

    const navigate = useNavigate();
    const alert = (message: string) => {
        setSnackbar({open: true, message: message, color: 'DarkRed'});
        setTimeout(() => setSnackbar({open: false}), 5000);
    };

    const errorAlert = (message: string) => {
        setSnackbar({open: true, message: message, color: 'red'});
        setTimeout(() => setSnackbar({open: false}), 5000);
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (scanCodeInput.length === 0) {
            alert(TextValue.ScanCodeRequired);
            return;
        }
        let checkScan = scanCodeInput.split('_');
        if (checkScan.length !== 2 || (checkScan[0] !== 'GRPO' &&  checkScan[0] !== '$GRPO') || !IsNumeric(checkScan[1])) {
            alert(TextValue.InvalidScanCode);
            return;
        }
        const id = parseInt(checkScan[1]);
        setLoading(true);
        fetchDocuments(id, [])
            .then(doc => {
                if (doc.length === 0) {
                    alert(StringFormat(TextValue.GoodsReceiptNotFound, id));
                    return;
                }
                const status = doc[0].status;

                if (status !== DocumentStatus.Open && status !== DocumentStatus.InProgress) {
                    alert(StringFormat(TextValue.GoodsReceiptStatusError, id, documentStatusToString(status)));
                    return;
                }
                navigate(`/goodsReceipt/${id}`);
            })
            .catch(error => errorAlert(`Validate Goods Receipt Error: ${error}`))
            .finally(() => setLoading(false));
    }

    return (
        <ContentTheme title={TextValue.GoodsReceipt} icon={<AssignmentTurnedInIcon/>}>
            {ScanForm()}
            <SnackbarAlert state={snackbar} onClose={() => setSnackbar({open: false})}/>
        </ContentTheme>
    )

    function ScanForm() {
        return (
            <form onSubmit={handleSubmit}>
                <Box mb={1} style={{textAlign: 'center'}}>
                    <TextField
                        fullWidth
                        required
                        label={TextValue.Code}
                        variant="outlined"
                        value={scanCodeInput}
                        type="password"
                        onChange={e => setScanCodeInput(e.target.value)}
                        autoFocus={true}
                    />
                    <Box mt={1}>
                        <Button type="submit" variant="contained" color="primary">
                            <DoneIcon/>
                            {TextValue.Accept}
                        </Button>
                    </Box>
                </Box></form>
        )
    }
}