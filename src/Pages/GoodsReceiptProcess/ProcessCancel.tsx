import React, {useEffect, useRef, useState} from "react";
import {Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextareaAutosize} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import TextField from "@mui/material/TextField";
import {ProcessAlertValue} from "./ProcessAlert";
import {useLoading} from "../../Components/LoadingContext";
import {fetchReasons, ReasonValue, updateLine, UpdateLineReturnValue} from "../GoodsReceiptSupervisor/Document";

export interface ProcessCancelProps {
    id: number;
    alert: ProcessAlertValue;
    onAccept: (alert: ProcessAlertValue) => void;
    onClose: () => void;
}


const ProcessCancel: React.FC<ProcessCancelProps> = ({id, alert, onAccept, onClose}) => {
    const {setLoading} = useLoading();
    const [open, setOpen] = useState(false);
    const [comment, setComment] = useState(alert.comment || '');
    const [userName, setUserName] = useState('');
    const [reason, setReason] = useState<ReasonValue | null>(null);
    const [reasons, setReasons] = useState<ReasonValue[]>([]);
    const usernameRef = useRef<HTMLInputElement>();

    useEffect(() => {
        setLoading(true);
        fetchReasons()
            .then(reasons => {
                setReasons(reasons);
                setOpen(true);
            })
            .catch((error) => {
                console.error(`Error loading reasons: ${error}`);
                let errorMessage = error.response?.data['exceptionMessage'];
                if (errorMessage)
                    window.alert(errorMessage);
                else
                    window.alert(`Error loading reasons: ${error}`);
            })
            .finally(() => setLoading(false));
    }, []);

    function handleClose() {
        setOpen(false);
        onClose();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        updateLine({id: id, lineID: alert.lineID ?? -1, comment: comment, userName: userName, reason: reason?.value ?? -1})
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
                    setTimeout(() => usernameRef.current?.focus(), 100);
                    return;
                }

                onAccept({
                    ...alert,
                    comment: comment,
                    canceled: true
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
                <DialogTitle>{TextValue.Cancel}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>{TextValue.Barcode}: </strong>{alert.barcode}
                    </DialogContentText>
                    <Box mb={1} style={{textAlign: 'center'}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="username"
                            inputRef={usernameRef}
                            label={TextValue.SupervisorCode}
                            type="password"
                            id="username"
                            autoComplete="current-password"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </Box>
                    <Box mb={1} style={{textAlign: 'center'}}>
                        <Autocomplete
                            value={reason}
                            options={reasons}
                            getOptionLabel={(option) => option.description}
                            onChange={(_, newValue) => setReason(newValue)}
                            renderInput={(params) =>
                                <TextField {...params} label={TextValue.Reason} required variant="outlined"/>
                            }
                        />
                    </Box>
                    <Box mb={1} style={{textAlign: 'center'}}>
                        {TextValue.Comment}
                        <TextareaAutosize style={{minHeight: '50px', width: '100%'}}
                                          minRows={3}
                                          maxRows={5}
                                          value={comment}
                                          onChange={(e) => setComment(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button type="submit" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
export default ProcessCancel;