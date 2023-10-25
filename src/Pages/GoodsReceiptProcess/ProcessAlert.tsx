import Box from "@mui/material/Box";
import {Alert, AlertColor, AlertTitle} from "@mui/material";
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import CancelIcon from '@mui/icons-material/Cancel';
import {TextValue} from "../../assets/TextValue";
import React from "react";
import {AddItemResponseMultipleValue} from "./Process";

export interface ProcessAlertValue {
    lineID?: number,
    barcode?: string | null;
    itemCode?: string | null;
    timeStamp?: string;
    message?: string;
    severity: AlertColor;
    comment?: string;
    canceled?: boolean;
    multiple?: AddItemResponseMultipleValue[];
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
    const getAlertStyle = () => {
        const style: React.CSSProperties = {
            position: 'relative',
        };

        let cancelled = alert.canceled ?? false;
        if (cancelled || (alert.multiple != null && alert.multiple.length > 0)) {
            style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        }
        if (cancelled) {
            style.textDecoration = 'line-through';
        }

        return style;
    };

    return (
        <Box mt={1} style={{position: 'relative'}}>
            <Alert variant="filled" severity={alert.severity} style={getAlertStyle()}>
                {alert.barcode && <AlertTitle><strong>{TextValue.Barcode}: </strong>{alert.barcode}</AlertTitle>}
                <strong>{TextValue.Time}: </strong>{alert.timeStamp} <br/>
                {alert.itemCode && <><span><strong>{TextValue.Item}: </strong>{alert.itemCode}</span><br/></>}
                {alert.message && (<><strong>{TextValue.Message}: </strong>{alert.message}</>)}
                {alert.multiple != null && alert.multiple.length > 0 && (<><br/><strong>{TextValue.Messages}: </strong>{
                    <>
                        {
                            alert.multiple.map(v => <Box mt={0.5}><Alert variant="filled" severity={v.severity}>{v.message}</Alert></Box>)
                        }
                    </>
                }</>)}
                {!(alert.canceled ?? false) && alert.severity !== 'error' &&
                    <div style={{position: 'absolute', top: '10px', right: '10px'}}>
                        <Box mt={0.5}>
                            <InsertCommentIcon onClick={() => onAction(AlertActionType.Comments)}/>
                        </Box>
                        <Box mt={0.5}>
                            <CancelIcon onClick={() => onAction(AlertActionType.Cancel)}/>
                        </Box>
                    </div>
                }
            </Alert>
        </Box>
    );
};

export default ProcessAlert;
