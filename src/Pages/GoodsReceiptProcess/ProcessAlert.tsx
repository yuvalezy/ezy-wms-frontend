import Box from "@mui/material/Box";
import {Alert, AlertColor, AlertTitle} from "@mui/material";
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import CancelIcon from '@mui/icons-material/Cancel';
import PinIcon from '@mui/icons-material/Pin';
import React from "react";
import {AddItemResponseMultipleValue} from "./Process";
import {useTranslation} from "react-i18next";

export interface ProcessAlertValue {
    lineID?: number,
    barcode?: string | null;
    itemCode?: string | null;
    numInBuy?: number,
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
    Cancel,
    NumInBuy,
}

const ProcessAlert: React.FC<ProcessAlertProps> = ({alert, onAction}) => {
    const {t} = useTranslation();
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
                {alert.barcode && <AlertTitle><strong>{t('barcode')}: </strong>{alert.barcode}</AlertTitle>}
                <strong>{t('time')}: </strong>{alert.timeStamp} <br/>
                {alert.itemCode && <>
                    <span><strong>{t('item')}: </strong>{alert.itemCode}</span>
                    <br/>
                    <span><strong>{t('numInBuy')}: </strong>{alert.numInBuy}</span>
                    <br/>
                </>}
                {alert.message && (<><strong>{t('message')}: </strong>{alert.message}</>)}
                {alert.multiple != null && alert.multiple.length > 0 && (<><br/><strong>{t('messages')}: </strong>{
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
                        <Box mt={0.5}>
                            <PinIcon onClick={() => onAction(AlertActionType.NumInBuy)}/>
                        </Box>
                    </div>
                }
            </Alert>
        </Box>
    );
};

export default ProcessAlert;
