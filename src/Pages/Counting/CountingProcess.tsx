import ContentTheme from "../../Components/ContentTheme";
import {useParams} from "react-router-dom";
import React, {CSSProperties, useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Label, MessageStrip, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {BinLocation} from "../../Assets/Common";
import {IsNumeric} from "../../Assets/Functions";
import {delay} from "../../Assets/GlobalConfig";
import {useAuth} from "../../Components/AppContext";
import BarCodeScanner, {BarCodeScannerRef} from "../../Components/BarCodeScanner";
import {CountingContent} from "../../Assets/Counting";
import BinLocationScanner from "../../Components/BinLocationScanner";
import {addItem, updateLine} from "./Data/CountingProcess";
import {fetchCountingContent} from "./Data/Counting";
import ProcessAlert, {ProcessAlertValue} from "../../Components/ProcessAlert";
import {ReasonType} from "../../Assets/Reasons";
import Processes, {ProcessesRef} from "../../Components/Processes";

export default function CountingProcess() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
    const [enable, setEnable] = useState(false);
    const {setLoading, setAlert} = useThemeContext();
    const {user} = useAuth();
    const barcodeRef = useRef<BarCodeScannerRef>(null);
    const [rows, setRows] = useState<CountingContent[] | null>(null);
    const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
    const processesRef = useRef<ProcessesRef>(null);

    const title = `${t("counting")} #${scanCode}`;

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
            delay(1).then(() => barcodeRef?.current?.focus());
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


    function getContentStyle(): CSSProperties {
        let properties: CSSProperties = {
            borderBottom: '1px solid darkGrey'
        };
        if (user?.binLocations) {
            properties.borderTop = '1px solid darkGrey'
        }
        return properties
    }

    function handleQuantityChanged(quantity: number) {
        if (currentAlert == null)
            return;
        acceptAlertChanged({
            ...currentAlert,
            quantity: quantity,
        });
    }

    function handleCancel(comment: string, cancel: boolean) {
        if (currentAlert == null)
            return;
        acceptAlertChanged({
            ...currentAlert,
            comment: comment,
            canceled: cancel,
        });
    }

    function acceptAlertChanged(newAlert: ProcessAlertValue): void {
        setCurrentAlert(newAlert);
        loadRows();
    }

    function handleAddItem(itemCode: string, barcode: string) {
        if (id == null) {
            return;
        }
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
                barcodeRef?.current?.clear();
                loadRows();
                barcodeRef?.current?.focus();
            })
            .catch((e) => {
                setAlert({
                    message: `Add Item Error Error: ${e}`,
                    type: MessageStripDesign.Negative,
                });
            })
            .finally(() => setLoading(false));
    }


    return (
        <ContentTheme title={title} icon="product">
            <div className="themeContentStyle">
                <div className="containerStyle">
                    {user?.binLocations && <BinLocationScanner onChanged={onBinChanged} onClear={onBinClear}/>}
                    <div className="contentStyle" style={getContentStyle()}>
                        {currentAlert && <ProcessAlert alert={currentAlert} onAction={(type) => processesRef?.current?.open(type)}/>}
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
                    <BarCodeScanner ref={barcodeRef} enabled={enable} onAddItem={handleAddItem}/>
                </div>
            </div>
            {currentAlert && id && <Processes ref={processesRef} id={id} alert={currentAlert} reasonType={ReasonType.Counting} onCancel={handleCancel}
                                              onQuantityChanged={handleQuantityChanged} onUpdateLine={updateLine}/>}
        </ContentTheme>
    );
}
