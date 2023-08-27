import {IconButton, Slide, Snackbar, SnackbarContent} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

interface SnackbarProps {
    state: SnackbarState,
    onClose?: () => void;
}

export type SnackbarState = {
    open: boolean;
    message?: string;
    color?: string;
};

const SnackbarAlert: React.FC<SnackbarProps> = ({state, onClose}) => {
    return (
        <Snackbar
            open={state.open}
            TransitionComponent={(props) => <Slide {...props} direction="up"/>}
        >
            <SnackbarContent
                message={
                    <span style={{display: 'flex', alignItems: 'center'}}>
                        <CheckCircleIcon style={{marginRight: '8px'}}/>
                        {state.message}
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
                sx={{ bgcolor: state.color }}
            />
        </Snackbar>
    );
}
export default SnackbarAlert;