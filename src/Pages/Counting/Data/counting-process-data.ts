import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {BinLocation, Counting, CountingContent, IsNumeric, Item, UnitType, useDateTimeFormat} from "@/assets";
import {useEffect, useRef, useState} from "react";
import {
  BarCodeScannerRef,
  BinLocationScannerRef,
  ProcessAlertValue,
  ProcessesRef,
  useAuth,
  useThemeContext
} from "@/components";
import {fetchCounting, fetchCountingContent} from "@/pages/Counting/data/Counting";
import {addItem} from "@/pages/Counting/data/CountingProcess";
import {getProcessInfo, TransferDocument} from "@/pages/transfer/data/transfer-document";

export const useCountingProcessData = () => {
  const {scanCode} = useParams();
  const {dateTimeFormat} = useDateTimeFormat();
  const [id, setID] = useState<string | null>();
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
  const [info, setInfo] = useState<Counting | null>(null);


  useEffect(() => {
    setEnable(!user?.binLocations);
    if (scanCode === null || scanCode === undefined) {
      setID(null);
      return;
    }
    setTimeout(() => {
      barcodeRef.current?.focus();
      binLocationRef.current?.focus();
    }, 1);
    setID(scanCode);
    fetchCounting(scanCode)
      .then((result) => setInfo(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [scanCode, user?.binLocations]);

  function onBinChanged(bin: BinLocation) {
    try {
      setBinLocation(bin);
      setEnable(true);
      loadRows(bin.entry);
      setTimeout(() => {
        barcodeRef?.current?.focus()
      }, 1);
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
    setTimeout(() => {
      binLocationRef?.current?.focus();
    }, 1);
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
    processAlertRef,
    info
  }
}