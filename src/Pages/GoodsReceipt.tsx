import React, {ReactEventHandler} from "react";
import MenuAppBar from "../Components/MenuAppBar";
import Box from "@mui/material/Box";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import {TextValue} from "../assets/TextValue";
import {Button, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import {useNavigate} from "react-router-dom";
import ContentTheme from "../Components/ContentTheme";
import {Functions} from "../assets/Functions";

export default function GoodsReceipt() {
    const [scanCodeInput, setScanCodeInput] = React.useState('GRPO_1');
    //todo remove default state:

    const navigate = useNavigate();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (scanCodeInput.length === 0) {
            alert(TextValue.ScanCodeRequired);
            return;
        }
        let checkScan = scanCodeInput.split('_');
        if (checkScan.length !== 2 || checkScan[0] !== 'GRPO' || !Functions.IsNumeric(checkScan[1])) {
            alert(TextValue.InvalidScanCode);
            return;
        }
        //todo validate in back-end valid GRPO
        navigate(`/goodsReceipt/${scanCodeInput.split('_')[1]}`);
    }

    return (
        <ContentTheme title={TextValue.GoodsReceipt} icon={<AssignmentTurnedInIcon/>}>
            {ScanForm()}
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