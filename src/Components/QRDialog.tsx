import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {Dialog, Bar, Button, DialogDomRef} from '@ui5/webcomponents-react';
import QRCode from 'qrcode.react';
import {useTranslation} from "react-i18next";

export interface QRDialogRef {
    show: (show: boolean) => void;
}
type QRDialogProps = {
    onClose: () => void;
    prefix: string;
    id: number | null;
};

const QRDialog = forwardRef((props: QRDialogProps, ref) => {
    const dialogRef = useRef<DialogDomRef>(null);
    const {t} = useTranslation();
    useImperativeHandle(ref, () => ({
        show(show: boolean) {
            if (show) {
                dialogRef?.current?.show();
            } else {
                dialogRef?.current?.close();
            }
        }
    }))
    return (
        <Dialog
            ref={dialogRef}
            className="footerPartNoPadding"
            footer={
                <Bar
                    design="Footer"
                    endContent={
                        <Button onClick={props.onClose}>{t('close')}</Button>
                    }
                />
            }
        >
            {props.id && (
                <QRCode
                    value={`${props.prefix}_${props.id}`}
                    width={200}
                    height={200}
                    color="black"
                    bgColor="white"
                />
            )}
        </Dialog>
    );
});

export default QRDialog;