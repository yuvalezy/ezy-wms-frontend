import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {Form, FormItem, Input, Button, InputDomRef, Title, Link, MessageStripDesign} from "@ui5/webcomponents-react";
import {BinLocation} from "../Assets/Common";
import {useTranslation} from "react-i18next";
import {scanBinLocation} from "../Assets/ScanBinLocation";
import {useThemeContext} from "./ThemeContext";
import { StringFormat } from '../Assets/Functions';

export interface BinLocationScannerProps {
    onScan?: (bin: BinLocation) => void;
    onChanged?: (bin: BinLocation) => void;
    onClear?: () => void;
}

export interface BinLocationScannerRef {
    focus: () => void;
    clear: () => void;
    getBin: () => string;
}

const BinLocationScanner = forwardRef<BinLocationScannerRef, BinLocationScannerProps>(({onScan, onChanged, onClear}, ref) => {
    const {setLoading, setAlert} = useThemeContext();
    const {t} = useTranslation();
    const binRef = useRef<InputDomRef>(null);
    const [binInput, setBinInput] = useState('');
    const [binLocation, setBinLocation] = useState<BinLocation | null>(null);

    useImperativeHandle(ref, () => ({
        focus() {
            binRef?.current?.focus();
        },
        clear() {
            setBinInput('');
        },
        getBin() {
            return binInput;
        }
    }));

    function errorMessage(message: string) {
        setAlert({
            message: message,
            type: MessageStripDesign.Negative,
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (binInput.length === 0) {
            return;
        }
        setLoading(true);
        try {
            scanBinLocation(binInput)
                .then((v) => {
                    if (v == null) {
                        errorMessage(StringFormat(t(`binLocationNotFound`), binInput));
                        setBinInput('');
                        setLoading(false);
                        return;
                    }
                    if (onChanged) {
                        setBinLocation(v);
                        onChanged(v);
                    }
                    if (onScan) {
                        onScan(v);
                    }
                })
                .catch((e) => {
                    errorMessage(`Bin Location Error: ${e}`);
                    setLoading(false);
                })
        } catch (e) {
            errorMessage(`Bin Location Error: ${e}`);
            setLoading(false);
        }
    };

    function clear() {
        setBinInput('');
        setBinLocation(null);
        if (onClear)
            onClear();
        binRef?.current?.focus();
    }

    return (
        <div style={{paddingBottom: '3px'}}>
            {binLocation &&
                <Title level="H5" style={{textAlign: 'center'}}>
                    <Link onClick={() => clear()}> {t("bin")}: {binLocation.code} </Link>
                </Title>}
            {!binLocation &&
                <Form onSubmit={handleSubmit}>
                    <FormItem label={t("bin")}>
                        <Input
                            value={binInput}
                            ref={binRef}
                            onInput={(e) => setBinInput(e.target.value as string)}
                            placeholder={t("scanBinLocation")} maxlength={255}/>
                    </FormItem>
                    <FormItem>
                        <Button type="Submit" icon="accept">
                            {t("accept")}
                        </Button>
                    </FormItem>
                </Form>
            }
        </div>
    );
});

export default BinLocationScanner;
