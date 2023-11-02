import React, {useRef, useState} from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import TextField from "@mui/material/TextField";
import {ProcessAlertValue} from "./ProcessAlert";
import {useLoading} from "../../Components/LoadingContext";
import {UpdateLineReturnValue} from "../GoodsReceiptSupervisor/Document";
import {updateLine} from "./Process";
import {useTranslation} from "react-i18next";

export interface ProcessNumInBuyProps {
    id: number;
    alert: ProcessAlertValue;
    onAccept: (alert: ProcessAlertValue) => void;
    onClose: () => void;
}


const ProcessNumInBuy: React.FC<ProcessNumInBuyProps> = ({id, alert, onAccept, onClose}) => {
    const {t} = useTranslation();
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
                        message = t('updateLineStatusError')
                        break;
                    case UpdateLineReturnValue.LineStatus:
                        message = t('updateLineLineStatusError')
                        break;
                    case UpdateLineReturnValue.CloseReason:
                        message = t('updateLineReason')
                        break;
                    case UpdateLineReturnValue.SupervisorPassword:
                        message = t('updateLineWrongSupervisorPassword')
                        break;
                    case UpdateLineReturnValue.NotSupervisor:
                        message = t('updateLineNotSupervisorError')
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
                <DialogTitle>{t('numInBuy')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>{t('barcode')}: </strong>{alert.barcode}
                    </DialogContentText>
                    <Box mb={1} style={{textAlign: 'center'}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="numInBuy"
                            inputRef={numInBuyRef}
                            label={t('supervisorCode')}
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
                            label={t('numInBuy')}
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
                        {t('cancel')}
                    </Button>
                    <Button type="submit" color="primary">
                        {t('accept')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
export default ProcessNumInBuy;