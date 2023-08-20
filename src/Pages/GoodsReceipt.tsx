import React from "react";
import MenuAppBar from "../Components/MenuAppBar";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import Box from "@mui/material/Box";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import {TextValue} from "../assets/TextValue";
import {Button, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { useNavigate} from "react-router-dom";

export default function GoodsReceipt() {
    const theme = createTheme();
    const [scanCodeInput, setScanCodeInput] = React.useState('GRPO_1');
    const navigate = useNavigate();

    function handleAcceptScan() {
        if (scanCodeInput.length === 0) {
            alert(TextValue.ScanCodeRequired);
            return;
        }
        //todo validate in back-end valid GRPO
        //change route to /goodsReceipt/1
        navigate(`/goodsReceipt/${scanCodeInput}`);
    }
    return (
        <ThemeProvider theme={theme}>
            <MenuAppBar title={TextValue.GoodsReceipt} icon={<AssignmentTurnedInIcon />}></MenuAppBar>
            <Box sx={{paddingTop: theme.spacing(10), paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2)}}>
                {ScanForm()}
            </Box>
        </ThemeProvider>
    )

    function ScanForm() {
        return (
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
                    <Button variant="contained" color="primary" onClick={handleAcceptScan}>
                        <DoneIcon />
                        {TextValue.Accept}
                    </Button>
                </Box>
            </Box>
        )
    }
}