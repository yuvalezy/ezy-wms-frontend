import React, {forwardRef, useImperativeHandle, useRef, useState, useEffect} from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BinLocation } from "../Assets/Common";
import {useTranslation} from "react-i18next";
import {scanBinLocation} from "../Assets/ScanBinLocation";
import {useThemeContext} from "./ThemeContext";
import { StringFormat } from '../Assets/Functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

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
    const {setLoading, setError} = useThemeContext();
    const {t} = useTranslation();
    const binRef = useRef<HTMLInputElement>(null);
    const [binInput, setBinInput] = useState('');
    const [binLocation, setBinLocation] = useState<BinLocation | null>(null);

    useImperativeHandle(ref, () => ({
        focus() {
            binRef?.current?.focus();
        },
        clear() {
            clear();
        },
        getBin() {
            return binInput;
        }
    }));

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
                        setError(StringFormat(t(`binLocationNotFound`), binInput));
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
                    setError(e);
                    setLoading(false);
                })
        } catch (e) {
            setError(e);
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
        <div className="p-2">
            {binLocation &&
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>
                            <Button variant="link" onClick={() => clear()} className="text-lg">
                                {t("bin")}: {binLocation.code} <FontAwesomeIcon icon={faTimes} className="ml-2" />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                </Card>
            }
            {!binLocation &&
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bin-input">{t("bin")}</Label>
                        <Input
                            id="bin-input"
                            value={binInput}
                            ref={binRef}
                            onChange={(e) => setBinInput(e.target.value)}
                            placeholder={t("scanBinLocation")} maxLength={255}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                        {t("accept")}
                    </Button>
                </form>
            }
        </div>
    );
});

export default BinLocationScanner;
