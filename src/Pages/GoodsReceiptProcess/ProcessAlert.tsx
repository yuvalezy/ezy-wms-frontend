import Box from "@mui/material/Box";
import {Alert, AlertColor, AlertTitle} from "@mui/material";
import {TextValue} from "../../assets/TextValue";
import React from "react";

export interface ProcessAlertValue {
    barcode?: string | null
    itemCode?: string | null
    timeStamp?: string;
    message?: string
    severity: AlertColor
}
export interface ProcessAlertProps {
    alert: ProcessAlertValue
}
const ProcessAlert : React.FC<ProcessAlertProps> = ({alert}) => {
    return (
        <Box mt={1}>
            <Alert variant="filled" severity={alert.severity}>
                {alert.barcode && <AlertTitle><strong>{TextValue.Barcode}: </strong>{alert.barcode}</AlertTitle>}
                <strong>{TextValue.Time}: </strong>{alert.timeStamp} <br />
                {alert.itemCode && <><span><strong>{TextValue.Item}: </strong>{alert.itemCode}</span><br/></>}
                <strong>{TextValue.Message}: </strong>{alert.message}
            </Alert>
        </Box>
    )
}
export default ProcessAlert;