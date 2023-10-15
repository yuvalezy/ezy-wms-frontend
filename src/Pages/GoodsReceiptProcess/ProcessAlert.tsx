import Box from "@mui/material/Box";
import {Alert, AlertColor, AlertTitle, Button} from "@mui/material";
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import {TextValue} from "../../assets/TextValue";
import React from "react";

export interface ProcessAlertValue {
    barcode?: string | null
    itemCode?: string | null
    timeStamp?: string;
    message?: string
    severity: AlertColor
    comment?: string
}
export interface ProcessAlertProps {
    alert: ProcessAlertValue
    // onEditComment: (comment: string) => void;
}
const ProcessAlert : React.FC<ProcessAlertProps> = ({alert}) => {
    return (
        <Box mt={1}>
            <Alert variant="filled" style={{position: 'relative'}} severity={alert.severity}>
                {alert.barcode && <AlertTitle><strong>{TextValue.Barcode}: </strong>{alert.barcode}</AlertTitle>}
                <strong>{TextValue.Time}: </strong>{alert.timeStamp} <br />
                {alert.itemCode && <><span><strong>{TextValue.Item}: </strong>{alert.itemCode}</span><br/></>}
                <strong>{TextValue.Message}: </strong>{alert.message}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <Button variant="contained" color="info" size="small">
                        <InsertCommentIcon />{TextValue.Comment}
                    </Button>
                </div>
            </Alert>
        </Box>
    )
}
export default ProcessAlert;