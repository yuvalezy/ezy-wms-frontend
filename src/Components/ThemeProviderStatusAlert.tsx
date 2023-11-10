import {MessageStrip, MessageStripDesign} from '@ui5/webcomponents-react';
import React from 'react';
import './ThemeProviderStatusAlert.css';

export type StatusAlert = {
    message: string,
    type?: MessageStripDesign,
}
export interface StatusAlertProps {
    alert: StatusAlert;
    onClose: () => void;
}
const ThemeProviderStatusAlert : React.FC<StatusAlertProps> = ({ alert, onClose }) => {
    if (!alert.message)
        return null;

    return (
        <div className="status-alert">
            <MessageStrip design={alert.type??MessageStripDesign.Information} onClose={() => onClose()}>
                {alert.message}
            </MessageStrip>
        </div>
    );
};


export default ThemeProviderStatusAlert;
