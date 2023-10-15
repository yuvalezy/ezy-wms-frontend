import Box from "@mui/material/Box";
import {Alert, AlertColor, AlertTitle} from "@mui/material";
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import CancelIcon from '@mui/icons-material/Cancel';
import {TextValue} from "../../assets/TextValue";
import React from "react";

export interface ProcessAlertValue {
    lineID?: number,
    barcode?: string | null;
    itemCode?: string | null;
    timeStamp?: string;
    message?: string;
    severity: AlertColor;
    comment?: string;
}

export interface ProcessAlertProps {
    alert: ProcessAlertValue;
    onAction: (type: AlertActionType) => void;
}

export enum AlertActionType {
    None = -1,
    Comments,
    Cancel
}

const ProcessAlert: React.FC<ProcessAlertProps> = ({alert, onAction}) => {

    return (
        <Box mt={1}>
            <Alert variant="filled" style={{position: 'relative'}} severity={alert.severity}>
                {alert.barcode && <AlertTitle><strong>{TextValue.Barcode}: </strong>{alert.barcode}</AlertTitle>}
                <strong>{TextValue.Time}: </strong>{alert.timeStamp} <br/>
                {alert.itemCode && <><span><strong>{TextValue.Item}: </strong>{alert.itemCode}</span><br/></>}
                <strong>{TextValue.Message}: </strong>{alert.message}
                <div style={{position: 'absolute', top: '10px', right: '10px'}}>
                    <Box mt={0.5}>
                        <InsertCommentIcon onClick={() => onAction(AlertActionType.Comments)}/>
                    </Box>
                    <Box mt={0.5}>
                        <CancelIcon onClick={() => onAction(AlertActionType.Cancel)}/>
                    </Box>
                </div>
            </Alert>
        </Box>
    );
};

export default ProcessAlert;
