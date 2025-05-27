import ContentTheme from "../../components/ContentTheme";
import {useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../components/ThemeContext";
import {useTranslation} from "react-i18next";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { MessageStripDesign} from "@ui5/webcomponents-react"; // Keep for MessageStripDesign enum
import {BinLocation, Item, UnitType} from "../../Assets/Common";
import {IsNumeric} from "../../Assets/Functions";
import {delay} from "../../Assets/GlobalConfig";
import {useAuth} from "../../components/AppContext";
import BarCodeScanner, {BarCodeScannerRef} from "../../components/BarCodeScanner";
import {CountingContent} from "../../Assets/Counting";
import BinLocationScanner, {BinLocationScannerRef} from "../../components/BinLocationScanner";
import {addItem, updateLine} from "./Data/CountingProcess";
import {fetchCountingContent} from "./Data/Counting";
import ProcessAlert, {ProcessAlertValue} from "../../components/ProcessAlert";
import {ReasonType} from "../../Assets/Reasons";
import Processes, {ProcessesRef} from "../../components/Processes";
import {ScrollableContentBox} from "../../components/ScrollableContent";
import {useDateTimeFormat} from "../../Assets/DateFormat";

export default function CountingProcess() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const { dateTimeFormat } = useDateTimeFormat();
    const [id, setID] = useState<number | null>();
    const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
    const binLocationRef = useRef<BinLocationScannerRef>(null);
    const [enable, setEnable] = useState(false);
    const {setLoading, setAlert, setError} = useThemeContext();
    const {user} = useAuth();
    const barcodeRef = useRef<BarCodeScannerRef>(null);
    const [rows, setRows] = useState<CountingContent[] | null>(null);
    const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
    const processesRef = useRef<ProcessesRef>(null);

    const title = `${t("counting")} #${scanCode}`;

    useEffect(() => {
        setEnable(!user?.binLocations);
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        delay(1).then(() => {
            barcodeRef.current?.focus();
            binLocationRef.current?.focus();
        });
        setID(parseInt(scanCode));
    }, [scanCode, user?.binLocations]);

    function onBinChanged(bin: BinLocation) {
        try {
            setBinLocation(bin);
            setEnable(true);
            loadRows(bin.entry);
            delay(1).then(() => barcodeRef?.current?.focus());
        } catch (e) {
            setError(e);
            setLoading(false);
        }
    }

    function onBinClear() {
        setBinLocation(null);
        setRows(null);
        setEnable(false);
        setCurrentAlert(null);
        delay(1).then(() => binLocationRef?.current?.focus());
    }


    function loadRows(binEntry?: number) {
        if (id == null) {
            return;
        }
        binEntry ??= binLocation?.entry;
        fetchCountingContent(id, binEntry)
            .then((v) => setRows(v))
            .catch((e) => {
                setError(e);
                setRows([]);
            })
            .finally(() => setLoading(false));
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

    function handleAddItem(item: Item, unit: UnitType) {
        if (id == null) {
            return;
        }
        addItem(id, item.code, item.barcode??"", binLocation?.entry, unit)
            .then((v) => {
                if (v.errorMessage != null) {
                    setError(v.errorMessage);
                    return;
                }
                let date = new Date(Date.now());
                setCurrentAlert({
                    lineID: v.lineID,
                    quantity: 1,
                    unit: unit,
                    purPackUn: v.packUnit,
                    purPackMsr: v.packMsr,
                    numInBuy: v.numIn,
                    buyUnitMsr: v.unitMsr,
                    barcode: item.barcode,
                    itemCode: item.code,
                    severity: MessageStripDesign.Information,
                    timeStamp: dateTimeFormat(date)
                })
                barcodeRef?.current?.clear();
                loadRows();
                barcodeRef?.current?.focus();
            })
            .catch((e) => {
                setError(e);
            })
            .finally(() => setLoading(false));
    }


    return (
        <ContentTheme title={title}>
            <div className="themeContentStyle">
                <div className="containerStyle">
                    {user?.binLocations && <BinLocationScanner ref={binLocationRef} onChanged={onBinChanged} onClear={onBinClear}/>}
                    <ScrollableContentBox borderUp={user?.binLocations??false}>
                        {currentAlert && <ProcessAlert alert={currentAlert} onAction={(type) => processesRef?.current?.open(type)}/>}
                        {rows != null && rows.length > 0 &&
                            <Table
                                columns={<>
                                    <TableColumn><Label>{t('code')}</Label></TableColumn>
                                    <TableColumn><Label>{t('units')}</Label></TableColumn>
                                    <TableColumn><Label>{t('dozens')}</Label></TableColumn>
                                    <TableColumn><Label>{t('packs')}</Label></TableColumn>
                                </>}
                            >
                                {rows.map((row) => (
                                    <>
                                        <TableRow key={row.code}>
                                            <TableCell><Label>{row.code}</Label></TableCell>
                                            <TableCell><Label>{row.unit}</Label></TableCell>
                                            <TableCell><Label>{row.dozen}</Label></TableCell>
                                            <TableCell><Label>{row.pack}</Label></TableCell>
                                        </TableRow>
                                        <TableGroupRow>
                                                <Label>{t('description')}: {row.name}</Label>
                                        </TableGroupRow>
                                    </>
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
                    </ScrollableContentBox>
                    {enable && <BarCodeScanner ref={barcodeRef} enabled unit onAddItem={handleAddItem}/>}
                </div>
            </div>
            {currentAlert && id && <Processes ref={processesRef} id={id} alert={currentAlert} reasonType={ReasonType.Counting} onCancel={handleCancel}
                                              onQuantityChanged={handleQuantityChanged} onUpdateLine={updateLine}/>}
        </ContentTheme>
    );
}
