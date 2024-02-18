import ContentTheme from "../../Components/ContentTheme";
import {Link, useParams} from "react-router-dom";
import React, {CSSProperties, MouseEventHandler, useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Grid, Icon, Input, InputDomRef, Label, MessageStrip, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {useAuth} from "../../Components/AppContext";
import {BinLocation, distinctItems, Item} from "../../Assets/Common";
import BarCodeScanner, {BarCodeScannerRef} from "../../Components/BarCodeScanner";
import {TransferBinContent} from "./Data/Transfer";
import BinLocationScanner from "../../Components/BinLocationScanner";
import {delay} from "../../Assets/GlobalConfig";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {fetchCountingContent} from "../Counting/Data/Counting";
import {scanBarcode} from "../../Assets/ScanBarcode";
import {addItem} from "../Counting/Data/CountingProcess";
import ProcessAlert, {AlertActionType, ProcessAlertValue} from "../../Components/ProcessAlert";

export default function TransferProcessTarget() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
    const [enable, setEnable] = useState(false);
    const {setLoading, setAlert} = useThemeContext();
    const {user} = useAuth();
    const barcodeRef = useRef<BarCodeScannerRef>(null);
    const [rows, setRows] = useState<TransferBinContent[] | null>(null);
    const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);

    const title = `${t("transfer")} #${scanCode} - ${t("selectTargetBin")}`;

    useEffect(() => {
        setEnable(!user?.binLocations ?? false);
        if (enable) {
            setTimeout(() => barcodeRef.current?.focus(), 1);
        }
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        setID(parseInt(scanCode));
    }, []);

    function onBinChanged(bin: BinLocation) {
        try {
            setBinLocation(bin);
            setEnable(true);
            loadRows(bin.entry);
            delay(1).then(() => focusBarCode());
        } catch (e) {
            setAlert({
                message: `Bin Location Changed Error: ${e}`,
                type: MessageStripDesign.Negative,
            });
            setLoading(false);
        }
    }

    function onBinClear() {
        setBinLocation(null);
        setRows(null);
        setEnable(false);
        setCurrentAlert(null);
    }


    function loadRows(binEntry?: number) {
        if (id == null) {
            return;
        }
        binEntry ??= binLocation?.entry;
        fetchCountingContent(id, binEntry)
            .then((v) => setRows(v))
            .catch((e) => {
                setAlert({
                    message: `Loading Rows Error: ${e}`,
                    type: MessageStripDesign.Negative,
                });
                setRows([]);
            })
            .finally(() => setLoading(false));
    }

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
                    alert({message: `Scan Bar Code Error: ${error}`, severity: MessageStripDesign.Negative});
                    setLoading(false);
                });
        } catch (e) {
            setAlert({
                message: `Scan Barcode Error: ${e}`,
                type: MessageStripDesign.Negative,
            });
        }
    }

    function clearBarCode() {
        barcodeRef?.current?.clear();
    }

    function focusBarCode() {
        barcodeRef?.current?.focus();
    }

    function handleItems(items: Item[]) {
        if (barcodeRef == null || barcodeRef.current == null) {
            return;
        }
        let barcode = barcodeRef.current.getBarcode();
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
            if (id == null) {
                return;
            }
            let itemCode = items[0].code;
            addItem(id, itemCode, barcode, binLocation?.entry)
                .then((v) => {
                    if (v.errorMessage != null) {
                        setAlert({
                            message: v.errorMessage,
                            type: MessageStripDesign.Negative,
                        });
                        return;
                    }
                    let date = new Date(Date.now());
                    setCurrentAlert({
                        lineID: v.lineID,
                        quantity: 1,
                        barcode: barcode,
                        itemCode: itemCode,
                        severity: MessageStripDesign.Information,
                        timeStamp: date.toLocaleDateString() + " " + date.toLocaleTimeString()
                    })
                    clearBarCode();
                    loadRows();
                    focusBarCode();
                })
                .catch((e) => {
                    setAlert({
                        message: `Add Item Error Error: ${e}`,
                        type: MessageStripDesign.Negative,
                    });
                })
                .finally(() => setLoading(false));
            // qtyPopupRef?.current?.show({barcode: barcode, itemCode: items[0].code});
            return;
        }
        handleMultipleItems(items);
    }

    function handleMultipleItems(items: Item[]) {
        const distinctCodes = distinctItems(items);
        if (distinctCodes.length !== 1) {
            let codes = distinctCodes.map((v) => `"${v}"`).join(", ");
            alert({
                message: StringFormat(t("multipleItemsError"), codes),
                severity: MessageStripDesign.Negative,
            });
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

    function getContentStyle(): CSSProperties {
        let properties: CSSProperties = {
            borderBottom: '1px solid darkGrey'
        };
        if (user?.binLocations) {
            properties.borderTop = '1px solid darkGrey'
        }
        return properties
    }

    function alertAction(type: AlertActionType) {
        // switch (type) {
        //     case AlertActionType.Cancel:
        //         processCancelRef?.current?.show(true);
        //         break;
        //     case AlertActionType.Quantity:
        //         processQuantityRef?.current?.show(true);
        //         break;
        // }
    }

    function handleAlertActionAccept(newAlert: ProcessAlertValue): void {
        setCurrentAlert(newAlert);
        loadRows();
    }

    return (
        <ContentTheme title={title} icon="functional-location">
            {id &&
                <div className="themeContentStyle">
                    <div className="containerStyle">
                        {user?.binLocations && <BinLocationScanner onChanged={onBinChanged} onClear={onBinClear}/>}
                        <div className="contentStyle" style={getContentStyle()}>
                            {currentAlert && <ProcessAlert alert={currentAlert} onAction={alertAction}/>}
                            {rows != null && rows.length > 0 &&
                                <Table
                                    columns={<>
                                        <TableColumn><Label>{t('code')}</Label></TableColumn>
                                        <TableColumn><Label>{t('description')}</Label></TableColumn>
                                        <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                                    </>}
                                >
                                    {rows.map((row) => (
                                        <TableRow key={row.code}>
                                            <TableCell><Label>{row.code}</Label></TableCell>
                                            <TableCell><Label>{row.name}</Label></TableCell>
                                            <TableCell><Label>{row.quantity}</Label></TableCell>
                                        </TableRow>
                                    ))}
                                </Table>
                            }
                            {rows != null && rows.length === 0 &&
                                <div style={{padding: '10px'}}>
                                    <MessageStrip hideCloseButton design={MessageStripDesign.Information}>
                                        {t("nodata")}
                                    </MessageStrip>
                                </div>
                            }
                        </div>
                        <BarCodeScanner ref={barcodeRef} onSubmit={handleScanBarcode} enabled={enable}/>
                    </div>
                </div>
            }
        </ContentTheme>
    );
}
