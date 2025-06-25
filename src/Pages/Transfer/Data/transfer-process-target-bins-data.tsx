import {useParams} from "react-router-dom";
import {BinLocation, IsNumeric, Item, SourceTarget, UnitType, useDateTimeFormat} from "@/assets";
import {useEffect, useRef, useState} from "react";
import {BarCodeScannerRef, ProcessAlertValue, ProcessesRef, useAuth, useThemeContext} from "@/components";
import {
  addItem,
  fetchTransferContent, getProcessInfo,
  TransferContent,
  TransferDocument
} from "@/pages/transfer/data/transfer-document";
import {useTranslation} from "react-i18next";

export const useTransferProcessTargetBinsData = () => {
  const {scanCode} = useParams();
  const {dateTimeFormat} = useDateTimeFormat();
  const [id, setID] = useState<string | null>();
  const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
  const [info, setInfo] = useState<TransferDocument | null>(null);
  const [enable, setEnable] = useState(false);
  const {setLoading, setError} = useThemeContext();
  const {user} = useAuth();
  const barcodeRef = useRef<BarCodeScannerRef>(null);
  const [rows, setRows] = useState<TransferContent[] | null>(null);
  const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
  const processesRef = useRef<ProcessesRef>(null);
  const processAlertRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();

  useEffect(() => {
    setEnable(!user?.binLocations);
    if (enable) {
      setTimeout(() => barcodeRef.current?.focus(), 1);
    }
    if (scanCode === null || scanCode === undefined) {
      setID(null);
      return;
    }
    setID(scanCode);
    getProcessInfo(scanCode)
      .then((result) => setInfo(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!id)
      return;
    const params = new URLSearchParams(window.location.search);
    const binParam = params.get('bin');
    if (binParam) {
      try {
        const bin = JSON.parse(binParam);
        onBinChanged(bin);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (e) {
        setError(e);
      }
    }
  }, [id]);

  function onBinChanged(bin: BinLocation) {
    try {
      setBinLocation(bin);
      setEnable(true);
      loadRows(bin.entry);
      setTimeout(() => {
        barcodeRef?.current?.focus();
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
  }


  function loadRows(binEntry?: number) {
    if (id == null) {
      return;
    }
    binEntry ??= binLocation?.entry;
    setLoading(true);
    fetchTransferContent({id, type: SourceTarget.Target, binEntry, targetBinQuantity: true})
      .then((v) => setRows(v))
      .catch((e) => {
        setError(e);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }

  function handleAddItem(item: Item, unit: UnitType) {
    if (id == null) {
      return;
    }
    const params = {id, itemCode: item.code, barcode: item.barcode, type: SourceTarget.Target, binEntry: binLocation?.entry, unit};
    addItem(params, t)
      .then((v) => {
        if (v.errorMessage != null) {
          setError(v.errorMessage);
          return;
        }
        let date = new Date(Date.now());
        setCurrentAlert({
          lineId: v.lineId,
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
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => setLoading(false));
    return;
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
  return {
    id,
    binLocation,
    enable,
    barcodeRef,
    rows,
    currentAlert,
    processesRef,
    processAlertRef,
    onBinChanged,
    onBinClear,
    loadRows,
    handleAddItem,
    handleQuantityChanged,
    handleCancel,
    scanCode,
    user,
    info
  }
}