import ContentTheme from "../../components/ContentTheme";
import React, {useEffect, useRef} from "react";
import {
    itemCheck,
    ItemCheckResponse,
    updateItemBarCode,
} from "./Item";
import ItemCheckMultipleResult from "./ItemCheckMultipleResult";
import ItemCheckResult from "./ItemCheckResult";
import {useTranslation} from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import {ResponseStatus} from "@/Assets/Common";
import {StringFormat} from "@/Assets/Functions";
import {useThemeContext} from "@/components/ThemeContext";

export default function ItemCheck() {
    const {t} = useTranslation();
    const [barcodeInput, setBarcodeInput] = React.useState("");
    const [itemCodeInput, setItemCodeInput] = React.useState("");
    const [result, setResult] = React.useState<ItemCheckResponse[] | null>(null);
    const {setLoading, setAlert, setError} = useThemeContext();
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTimeout(() => barcodeInputRef.current?.focus(), 1);
    }, []);

    function handleCheckSubmit() {
        let barcodeLength = barcodeInput.length === 0;
        let itemCodeLength = itemCodeInput.length === 0;
        if (barcodeLength && itemCodeLength) {
            setAlert({message: t("barcodeOrItemRequired"), type: "warning"});
            return;
        }

        setLoading(true);
        executeItemCheck(itemCodeInput, barcodeInput);
    }

    function executeItemCheck(itemCode: string, barCode: string) {
        itemCheck(itemCode, barCode)
            .then(function (items) {
                setResult(items);
            })
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }

    function handleUpdateSubmit(itemCode: string, checkedBarcodes: string[], newBarcode: string) {
        setLoading(true);
        executeUpdateItemBarcode(itemCode, checkedBarcodes, newBarcode);
    }

    function executeUpdateItemBarcode(
        itemCode: string,
        checkedBarcodes: string[],
        newBarcode: string
    ) {
        updateItemBarCode(itemCode, checkedBarcodes, newBarcode)
            .then((response) => {
                if (response.status === ResponseStatus.Ok) {
                    executeItemCheck(itemCode, "");
                } else {
                    let errorMessage: string;
                    if (response.existItem != null) {
                        errorMessage = `Barcode ${newBarcode} already exists for item ${response.existItem}`;
                    } else {
                        errorMessage = response.errorMessage ?? "Unknown error";
                    }
                    setError(errorMessage);
                    setLoading(false);
                }
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            })
            .finally(function () {
                setResult(result);
            });
    }

    async function handleSetBarcodeItem(index: number) {
        if (result == null) return;
        let itemCode: string = result[index].itemCode;
        if (
            !window.confirm(
                StringFormat(t("confirmItemBarCode"), itemCode, barcodeInput)
            )
        ) {
            return;
        }
        setLoading(true);
        for (let i = 0; i < result.length; i++) {
            if (i === index) {
                continue;
            }
            await updateItemBarCode(
                result[i].itemCode,
                [barcodeInput],
                ""
            );
        }
        executeItemCheck(itemCode, "");
    }

    function handleClear() {
        setItemCodeInput("");
        setBarcodeInput("");
        setResult(null);
    }

    return (
        <ContentTheme title={t("itemCheck")}>
            {(result == null || result.length === 0) && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("itemCheck")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="barcode">{t("barcode")}</Label>
                            <Input
                                id="barcode"
                                required={itemCodeInput.length === 0}
                                disabled={itemCodeInput.length > 0}
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                ref={barcodeInputRef}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">{t("code")}</Label>
                            <Input
                                id="code"
                                required={barcodeInput.length === 0}
                                disabled={barcodeInput.length > 0}
                                value={itemCodeInput}
                                onChange={(e) => setItemCodeInput(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => handleCheckSubmit()} className="w-full">
                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                            {t("accept")}
                        </Button>
                    </CardContent>
                </Card>
            )}
            {result && (
                <div className="space-y-4">
                    {result.length === 0 && (
                        <Alert className="border-red-200 bg-red-50">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-red-600" />
                            <AlertDescription>
                                {t("noDataFound")}
                            </AlertDescription>
                        </Alert>
                    )}
                    {result.length === 1 && (
                        <ItemCheckResult
                            result={result[0]}
                            submit={handleUpdateSubmit}
                        />
                    )}
                    {result.length > 1 && (
                        <ItemCheckMultipleResult
                            barcode={barcodeInput}
                            result={result}
                            clear={handleClear}
                            setBarcodeItem={handleSetBarcodeItem}
                        />
                    )}
                </div>
            )}
        </ContentTheme>
    );
}
