import {IconButton, Slide, Snackbar, SnackbarContent} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

interface SnackbarProps {
    open: boolean;
    message?: string;
    color?: string;
    onClose?: () => void;
}

const ConfirmationSnackbar: React.FC<SnackbarProps> = ({open, message, color, onClose}) => {
    return (
        <Snackbar
            open={open}
            TransitionComponent={(props) => <Slide {...props} direction="up"/>}
        >
            <SnackbarContent
                message={
                    <span style={{display: 'flex', alignItems: 'center'}}>
                        <CheckCircleIcon style={{marginRight: '8px'}}/>
                        {message}
                    </span>
                }
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={onClose}
                    >
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                }
                sx={{ bgcolor: color }}
            />
        </Snackbar>
    );
}
export default ConfirmationSnackbar;