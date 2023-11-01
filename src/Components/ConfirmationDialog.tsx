import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import React from "react";
import {useTranslation} from "react-i18next";

interface ConfirmationDialogProps {
    title: string;
    text: string;
    reverse?: boolean;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({title, text, reverse, open, onClose, onConfirm}) => {
    const {t} = useTranslation();
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {text}
                    {reverse && <> <br /> {t('ActionCannotReverse')} </>}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} color="primary">
                    {t('No')}
                </Button>
                <Button variant="contained" onClick={onConfirm} color="error">
                    {t('Yes')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmationDialog;
