import ContentTheme from "../Components/ContentTheme";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import Box from "@mui/material/Box";
import {Alert, Button, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import React from "react";
import {useLoading} from "../Components/LoadingContext";
import {itemCheck, ItemCheckResponse, updateItemBarCode} from "./ItemCheck/Item";
import {ResponseStatus} from "../assets/Common";
import {StringFormat} from "../assets/Functions";
import ItemCheckMultipleResult from "./ItemCheck/ItemCheckMultipleResult";
import ItemCheckResult from "./ItemCheck/ItemCheckResult";
import {useTranslation} from "react-i18next";

export default function ItemCheck() {
    const {t} = useTranslation();
    const [barcodeInput, setBarcodeInput] = React.useState('');
    const [itemCodeInput, setItemCodeInput] = React.useState('');
    const [result, setResult] = React.useState<ItemCheckResponse[] | null>(null);
    const {setLoading} = useLoading();

    function handleCheckSubmit(e: React.FormEvent) {
        e.preventDefault();
        let barcodeLength = barcodeInput.length === 0;
        let itemCodeLength = itemCodeInput.length === 0;
        if (barcodeLength && itemCodeLength) {
            window.alert(t('BarcodeOrItemRequired'));
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
            .catch(error => window.alert({message: `Item Check Error: ${error}`, severity: 'error'}))
            .finally(() => setLoading(false));
    }

    function handleUpdateSubmit(checkedBarcodes: string[], newBarcode: string) {
        setLoading(true);
        executeUpdateItemBarcode(itemCodeInput, checkedBarcodes, newBarcode);
    }

    function executeUpdateItemBarcode(itemCode: string, checkedBarcodes: string[], newBarcode: string) {
        updateItemBarCode(itemCode, checkedBarcodes, newBarcode)
            .then((response) => {
                if (response.status === ResponseStatus.Ok) {
                    executeItemCheck(itemCode, '');
                } else {
                    if (response.existItem != null) {
                        window.alert(`Barcode ${newBarcode} already exists for item ${response.existItem}`);
                    } else {
                        window.alert(response.errorMessage ?? 'Unknown error');
                    }
                    setLoading(false);
                }
            })
            .catch(error => {
                window.alert(`Item Check Error: ${error}`);
                setLoading(false);
            })
            .finally(function () {
                setResult(result);
            })
    }

    async function handleSetBarcodeItem(index: number) {
        if (result == null)
            return;
        let itemCode: string = result[index].itemCode;
        if (!window.confirm(StringFormat(t('ConfirmItemBarCode'), itemCode, barcodeInput))) {
            return;
        }
        setLoading(true);
        for (let i = 0; i < result.length; i++) {
            if (i === index) {
                continue;
            }
            await updateItemBarCode(result[i].itemCode, [barcodeInput], '');
        }
        executeItemCheck(itemCode, '');
    }

    function handleClear() {
        setItemCodeInput('');
        setBarcodeInput('');
        setResult(null);
    }


    return (
        <ContentTheme title={t('ItemCheck')} icon={<CheckBoxIcon/>}>
            {
                (result == null || result.length === 0) &&
                <form onSubmit={handleCheckSubmit}>
                    <>
                        <Box mb={1} style={{textAlign: 'center'}}>
                            <TextField
                                fullWidth
                                required={itemCodeInput.length === 0}
                                disabled={itemCodeInput.length > 0}
                                label={t('Barcode')}
                                variant="outlined"
                                value={barcodeInput}
                                onChange={e => setBarcodeInput(e.target.value)}
                                autoFocus={true}
                            />
                        </Box>
                        <Box mb={1} style={{textAlign: 'center'}}>
                            <TextField
                                fullWidth
                                required={barcodeInput.length === 0}
                                disabled={barcodeInput.length > 0}
                                label={t('Code')}
                                variant="outlined"
                                value={itemCodeInput}
                                onChange={e => setItemCodeInput(e.target.value)}
                            />
                            <Box mt={1}>
                                <Button type="submit" variant="contained" color="primary">
                                    <DoneIcon/>
                                    {t('Accept')}
                                </Button>
                            </Box>
                        </Box>
                    </>
                </form>
            }
            {
                result &&
                <>
                    {result.length === 0 && <Alert variant="filled" severity="error"> {t('NoDataFound')} </Alert>}
                    {result.length === 1 && <ItemCheckResult result={result[0]} clear={handleClear} submit={handleUpdateSubmit}/>}
                    {result.length > 1 && <ItemCheckMultipleResult barcode={barcodeInput} result={result} clear={handleClear} setBarcodeItem={handleSetBarcodeItem}/>}
                </>
            }
        </ContentTheme>
    )
}