import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {Form, FormItem, Input, Button, InputDomRef} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {scanBarcode} from "../Assets/ScanBarcode";
import {distinctItems, Item} from "../Assets/Common";
import {StringFormat} from "../Assets/Functions";
import {useThemeContext} from "./ThemeContext";
import {useTranslation} from "react-i18next";

export interface BarCodeScannerProps {
    enabled: boolean;
    onAddItem: (itemCode: string, barcode: string) => void;
}

export interface BarCodeScannerRef {
    clear: () => void;
    focus: () => void;
    getValue: () => string;
}

const BarCodeScanner = forwardRef<BarCodeScannerRef, BarCodeScannerProps>(({enabled, onAddItem}, ref) => {
    const barcodeRef = useRef<InputDomRef>(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const {setLoading, setAlert, setError} = useThemeContext();
    const {t} = useTranslation();

    useImperativeHandle(ref, () => ({
        clear() {
            setBarcodeInput('');
        },
        focus() {
            barcodeRef?.current?.focus();
        },
        getValue() {
            return barcodeInput;
        }
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleScanBarcode(barcodeInput);
    };

    function handleScanBarcode(barcode: string) {
        try {
            if (barcode.length === 0) {
                setAlert({message: t("barcodeRequired"), type: MessageStripDesign.Warning});
                return;
            }

            setLoading(true);
            scanBarcode(barcode)
                .then((items) => handleItems(items))
                .catch((error) => {
                    setError(error);
                    setLoading(false);
                });
        } catch (e) {
            setError(e);
            setLoading(false);
        }
    }

    function clearBarCode() {
        setBarcodeInput('');
    }

    function focusBarCode() {
        barcodeRef?.current?.focus();
    }

    function handleItems(items: Item[]) {
        if (barcodeRef == null || barcodeRef.current == null) {
            return;
        }
        let barcode = barcodeInput;
        if (items.length === 0) {
            alert({
                barcode: barcode,
                message: StringFormat(t("barcodeNotFound"), barcode),
                severity: MessageStripDesign.Negative,
            });
            clearBarCode();
            setLoading(false);
            return;
        }
        if (items.length === 1) {
            let itemCode = items[0].code;
            onAddItem(itemCode, barcode);
            // qtyPopupRef?.current?.show({barcode: barcode, itemCode: items[0].code});
            return;
        }
        handleMultipleItems(items);
    }

    function handleMultipleItems(items: Item[]) {
        const distinctCodes = distinctItems(items);
        if (distinctCodes.length !== 1) {
            let codes = distinctCodes.map((v) => `"${v}"`).join(", ");
            setError(StringFormat(t("multipleItemsError"), codes));
            setLoading(false);
            return;
        }
        window.alert('Multiple Boxes not implemented yet');
        setLoading(false);
        // setBoxItem(distinctCodes[0]);
        // setBoxItems(items);
        // boxConfirmationDialogRef?.current?.show(true);
        // setLoading(false);
    }

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
