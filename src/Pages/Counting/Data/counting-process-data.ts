import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {BinLocation, CountingContent, delay, IsNumeric, Item, UnitType, useDateTimeFormat} from "@/assets";
import {useEffect, useRef, useState} from "react";
import {
  BarCodeScannerRef,
  BinLocationScannerRef,
  ProcessAlertValue,
  ProcessesRef,
  useAuth,
  useThemeContext
} from "@/components";
import {fetchCountingContent} from "@/pages/Counting/data/Counting";
import {addItem} from "@/pages/Counting/data/CountingProcess";

export const useCountingProcessData = () => {
  const {scanCode} = useParams();
  const {t} = useTranslation();
  const {dateTimeFormat} = useDateTimeFormat();
  const [id, setID] = useState<number | null>();
  const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
  const binLocationRef = useRef<BinLocationScannerRef>(null);
  const [enable, setEnable] = useState(false);
  const {setLoading, setError} = useThemeContext();
  const {user} = useAuth();
  const barcodeRef = useRef<BarCodeScannerRef>(null);
  const [rows, setRows] = useState<CountingContent[] | null>(null);
  const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
  const processesRef = useRef<ProcessesRef>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const processAlertRef = useRef<HTMLDivElement>(null);


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
    addItem(id, item.code, item.barcode ?? "", binLocation?.entry, unit)
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
          severity: "Information",
          timeStamp: dateTimeFormat(date)
        })
        barcodeRef?.current?.clear();
        loadRows();
        barcodeRef?.current?.focus();
        setTimeout(() => {
          processAlertRef?.current?.scrollIntoView({behavior: "smooth", block: "start"});
        }, 100);
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => setLoading(false));
  }

  return {
    id,
    binLocation,
    binLocationRef,
    enable,
    user,
    barcodeRef,
    rows,
    currentAlert,
    processesRef,
    onBinChanged,
    onBinClear,
    handleQuantityChanged,
    handleCancel,
    handleAddItem,
    scrollRef,
    processAlertRef
  }
}