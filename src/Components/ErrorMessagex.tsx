import {Alert, Box, Typography} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import {TextValue} from "../assets/TextValue";
import React from "react";

interface ErrorMessageProps {
    text: string
}
const ErrorMessage: React.FC<ErrorMessageProps> = ({text}) => {
    return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
            <Alert severity="error" icon={<ErrorIcon fontSize="inherit"/>} variant="filled">
                <Typography variant="h6">
                    {text}
                </Typography>
            </Alert>
        </Box>
    )
}

export default ErrorMessage;