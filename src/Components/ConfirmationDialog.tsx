import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import React from "react";
import {TextValue} from "../assets/TextValue";

interface ConfirmationDialogProps {
    title: string;
    text: string;
    reverse?: boolean;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({title, text, reverse, open, onClose, onConfirm}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {text}
                    {reverse && <> <br /> {TextValue.ActionCannotReverse} </>}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} color="primary">
                    {TextValue.No}
                </Button>
                <Button variant="contained" onClick={onConfirm} color="error">
                    {TextValue.Yes}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmationDialog;
