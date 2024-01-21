import React from "react";
import {useTranslation} from "react-i18next";
import {Icon, MessageStrip, Title} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {AddItemResponseMultipleValue} from "../../../Assets/Document";
export interface ProcessAlertValue {
    lineID?: number,
    barcode?: string | null;
    itemCode?: string | null;
    quantity?: number,
    timeStamp?: string;
    message?: string;
    severity: MessageStripDesign;
    comment?: string;
    canceled?: boolean;
}

export interface ProcessAlertProps {
    alert: ProcessAlertValue;
    onAction: (type: AlertActionType) => void;
}

export enum AlertActionType {
    Cancel,
    Quantity,
}

const ProcessAlert: React.FC<ProcessAlertProps> = ({alert, onAction}) => {
    const {t} = useTranslation();
    const getAlertStyle = () => {
        const style: React.CSSProperties = {
            position: 'relative',
        };

        let cancelled = alert.canceled ?? false;
        if (cancelled) {
            style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            style.textDecoration = 'line-through';
        }

        return style;
    };

    return (
        <div style={{position: 'relative', padding: '5px'}}>
            <MessageStrip hideCloseButton design={alert.severity} style={getAlertStyle()}>
                {alert.barcode && <Title level="H4"><strong>{t('barcode')}: </strong>{alert.barcode}</Title>}
                <strong>{t('time')}: </strong>{alert.timeStamp} <br/>
                {alert.itemCode && <>
                    <span><strong>{t('item')}: </strong>{alert.itemCode}</span>
                    <br/>
                    <span><strong>{t('quantity')}: </strong>{alert.quantity}</span>
                    <br/>
                </>}
                {alert.message && (<><strong>{t('message')}: </strong>{alert.message}</>)}
                {!(alert.canceled ?? false) && alert.severity !== 'Negative' &&
                    <div style={{position: 'absolute', top: '10px', right: '10px'}}>
                        <Icon name="cancel" onClick={() => onAction(AlertActionType.Cancel)}/>
                        <br/>
                        <Icon name="numbered-text" onClick={() => onAction(AlertActionType.Quantity)}/>
                    </div>
                }
            </MessageStrip>
        </div>
    );
};

export default ProcessAlert;
