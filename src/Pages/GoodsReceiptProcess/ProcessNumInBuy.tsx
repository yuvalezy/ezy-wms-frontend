import React, {useEffect, useRef, useState} from "react";
import {Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextareaAutosize} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import TextField from "@mui/material/TextField";
import {ProcessAlertValue} from "./ProcessAlert";
import {useLoading} from "../../Components/LoadingContext";
import {fetchReasons, ReasonValue, UpdateLineReturnValue} from "../GoodsReceiptSupervisor/Document";
import {updateLine} from "./Process";

export interface ProcessNumInBuyProps {
    id: number;
    alert: ProcessAlertValue;
    onAccept: (alert: ProcessAlertValue) => void;
    onClose: () => void;
}


const ProcessNumInBuy: React.FC<ProcessNumInBuyProps> = ({id, alert, onAccept, onClose}) => {
    const {setLoading} = useLoading();
    const [open, setOpen] = useState(true);
    const [userName, setUserName] = useState('');
    const [numInBuy, setNumInBuy] = useState<number>(alert.numInBuy??1);
    const numInBuyRef = useRef<HTMLInputElement>();

    function handleClose() {
        setOpen(false);
        onClose();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        updateLine({id: id, lineID: alert.lineID ?? -1, numInBuy: numInBuy, userName: userName})
            .then((value) => {
                let message: string | null = null;
                switch (value) {
                    case UpdateLineReturnValue.Status:
                        message = TextValue.UpdateLineStatusError
                        break;
                    case UpdateLineReturnValue.LineStatus:
                        message = TextValue.UpdateLineLineStatusError
                        break;
                    case UpdateLineReturnValue.CloseReason:
                        message = TextValue.UpdateLineReason
                        break;
                    case UpdateLineReturnValue.SupervisorPassword:
                        message = TextValue.UpdateLineWrongSupervisorPassword
                        break;
                    case UpdateLineReturnValue.NotSupervisor:
                        message = TextValue.UpdateLineNotSupervisorError
                        break;
                }
                if (message !== null) {
                    window.alert(message);
                    setUserName('');
                    setLoading(false);
                    setTimeout(() => numInBuyRef.current?.focus(), 100);
                    return;
                }

                onAccept({
                    ...alert,
                    numInBuy: numInBuy
                });
                handleClose();
                setLoading(false);
            })
            .catch(error => {
                console.error(`Error performing update: ${error}`);
                let errorMessage = error.response?.data['exceptionMessage'];
                if (errorMessage)
                    window.alert(errorMessage);
                else
                    window.alert(`Update Line Error: ${error}`);
                setLoading(false);
            });
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{TextValue.NumInBuy}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>{TextValue.Barcode}: </strong>{alert.barcode}
                    </DialogContentText>
                    <Box mb={1} style={{textAlign: 'center'}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="numInBuy"
                            inputRef={numInBuyRef}
                            label={TextValue.SupervisorCode}
                            type="password"
                            id="numInBuy"
                            autoComplete="current-password"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </Box>
                    <Box mb={1} style={{textAlign: 'center'}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="numInBuy"
                            inputRef={numInBuyRef}
                            label={TextValue.NumInBuy}
                            type="number"
                            id="numInBuy"
                            value={numInBuy}
                            onChange={function (e) {
                                let value = e.target.value;
                                return setNumInBuy(value.length > 0 ? parseInt(value) : 1);
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        {TextValue.Cancel}
                    </Button>
                    <Button type="submit" color="primary">
                        {TextValue.Accept}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
export default ProcessNumInBuy;