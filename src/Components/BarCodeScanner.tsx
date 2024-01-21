import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {Form, FormItem, Input, Button, InputDomRef} from "@ui5/webcomponents-react";

export interface BarCodeScannerProps {
    onSubmit: (barcode: string) => void;
    enabled: boolean;
}

export interface BarCodeScannerRef {
    focus: () => void;
    clear: () => void;
    getBarcode: () => string;
}

const BarCodeScanner = forwardRef<BarCodeScannerRef, BarCodeScannerProps>(({onSubmit, enabled}, ref) => {
    const barcodeRef = useRef<InputDomRef>(null);
    const [barcodeInput, setBarcodeInput] = useState('');

    useImperativeHandle(ref, () => ({
        focus() {
            barcodeRef?.current?.focus();
        },
        clear() {
            setBarcodeInput('');
        },
        getBarcode() {
            return barcodeInput;
        }
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(barcodeInput);
    };

    return (
        <Form onSubmit={handleSubmit} style={{paddingBottom: '3px'}}>
            <FormItem label="Barcode">
                <Input required
                       value={barcodeInput}
                       ref={barcodeRef}
                       onInput={(e) => setBarcodeInput(e.target.value as string)}
                       disabled={!enabled}
                ></Input>
            </FormItem>
            <FormItem>
                <Button type="Submit" disabled={!enabled}>Accept</Button>
            </FormItem>
        </Form>
    );
});

export default BarCodeScanner;
