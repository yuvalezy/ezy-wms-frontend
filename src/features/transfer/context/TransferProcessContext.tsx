import React, {createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router";
import {useTranslation} from "react-i18next";
import axios from "axios";
import {toast} from "sonner";
import {AddItemValue, PackageValue, ProcessAlertValue, useAuth, useThemeContext} from "@/components";
import {BinLocation} from "@/features/items/data/items";
import {
  AddItemParameters,
  SourceTarget,
  TransferAddSourcePackageRequest,
  TransferAddTargetPackageRequest,
  TransferContent,
  TransferDocument
} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {TransferProcessContextType} from "./types";
import {StringFormat} from "@/utils/string-utils";

// Default context values
const TransferProcessContextDefaultValues: TransferProcessContextType = {
  id: null,
  scanCode: undefined,
  info: null,
  binLocation: null,
  onBinChanged: () => console.warn("onBinChanged not implemented"),
  onBinClear: () => console.warn("onBinClear not implemented"),
  rows: null,
  loadRows: () => console.warn("loadRows not implemented"),
  currentAlert: null,
  handleQuantityChanged: () => console.warn("handleQuantityChanged not implemented"),
  handleCancel: () => console.warn("handleCancel not implemented"),
  isProcessingItem: false,
  handleAddItem: () => console.warn("handleAddItem not implemented"),
  handleAddPackage: () => console.warn("handleAddPackage not implemented"),
  barcodeRef: {current: null},
  processesRef: {current: null},
  processAlertRef: {current: null},
  user: null,
  isLoading: true,
  enable: false,
  setEnable: () => console.warn("setEnable not implemented"),
  finish: () => console.warn("finish not implemented"),
};

export const TransferProcessContext = createContext<TransferProcessContextType>(
  TransferProcessContextDefaultValues
);

interface TransferProcessProviderProps {
  children: ReactNode;
}

export const TransferProcessProvider: React.FC<TransferProcessProviderProps> = ({children}) => {
  const {scanCode} = useParams();
  console.log("scanCode", scanCode);
  const location = useLocation();
  const {t} = useTranslation();
  const {dateTimeFormat} = useDateTimeFormat();
  const {setLoading, setError} = useThemeContext();
  const {user} = useAuth();
  const navigate = useNavigate();

  // State
  const [id, setID] = useState<string | null>(null);
  const [info, setInfo] = useState<TransferDocument | null>(null);
  const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
  const [rows, setRows] = useState<TransferContent[] | null>(null);
  const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
  const [isProcessingItem, setIsProcessingItem] = useState(false);
  const [enable, setEnable] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(true);

  // Refs
  const barcodeRef = useRef<any>(null);
  const processesRef = useRef<any>(null);
  const processAlertRef = useRef<HTMLDivElement>(null);

  // Load rows based on type - removed binLocation?.entry from dependencies to break circular dependency
  const loadRows = useCallback((type: SourceTarget, binEntry?: number) => {
    if (id == null) return;

    setLoading(true);

    const params: any = {
      id,
      type,
      binEntry: binEntry
    };

    // Add targetBinQuantity for target operations
    if (type === SourceTarget.Target) {
      params.targetBinQuantity = true;
    }

    transferService.fetchContent(params)
      .then((v) => setRows(v))
      .catch((e) => {
        setError(e);
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [id, setLoading, setError]);

  // Bin location handlers
  const onBinChanged = useCallback((bin: BinLocation, type: SourceTarget) => {
    try {
      setBinLocation(bin);
      setEnable(true);
      loadRows(type, bin.entry);
      setTimeout(() => {
        barcodeRef?.current?.focus();
      }, 1);
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }, [loadRows, setError, setLoading]);

  const onBinClear = useCallback(() => {
    setBinLocation(null);
    setRows(null);
    setEnable(false);
    setCurrentAlert(null);
  }, []);

  // Initialize transfer document info
  useEffect(() => {
    setIsLoadingState(true);
    setEnable(!user?.binLocations);

    if (scanCode === null || scanCode === undefined) {
      setID(null);
      setIsLoadingState(false);
      return;
    }

    setID(scanCode);
    transferService.getProcessInfo(scanCode)
      .then((result) => setInfo(result))
      .catch((error) => setError(error))
      .finally(() => {
        setLoading(false);
        setIsLoadingState(false);
      });
  }, [scanCode, user?.binLocations, setError, setLoading]);

  // Handle bin query parameter - removed onBinChanged from dependencies to prevent circular updates
  useEffect(() => {
    if (!id) return;

    const params = new URLSearchParams(location.search);
    const binParam = params.get('bin');

    if (binParam) {
      try {
        const bin = JSON.parse(binParam);
        // Determine type based on current path
        const type = location.pathname.includes('/source') ? SourceTarget.Source : SourceTarget.Target;

        // Set bin location directly instead of using onBinChanged to avoid circular updates
        setBinLocation(bin);
        setEnable(true);
        loadRows(type, bin.entry);
        setTimeout(() => {
          barcodeRef?.current?.focus();
        }, 1);

        // Clean up URL
        window.history.replaceState({}, '', location.pathname);
      } catch (e) {
        setError(e);
      }
    }
  }, [id, location.search, location.pathname, setError, loadRows]);

  // Focus barcode scanner when enabled
  useEffect(() => {
    if (enable) {
      setTimeout(() => barcodeRef.current?.focus(), 1);
    }
  }, [enable]);

  // Clear bin location and rows when navigating between source and target pages
  useEffect(() => {
    // Only clear when actually navigating between different page types
    // Check if the pathname has changed from source to target or vice versa
    const isSourcePage = location.pathname.includes('/source');
    const isTargetPage = location.pathname.includes('/targetBins');

    // Clear state when switching between source and target
    if ((isSourcePage || isTargetPage) && !location.search.includes('bin=')) {
      // Clear bin location state when switching pages without a bin parameter
      setBinLocation(null);
      setRows(null);
      setEnable(false);
      setCurrentAlert(null);
    }
  }, [location.pathname, location.search]);

  // Reload transfer info when navigating back to main transfer page
  useEffect(() => {
    if (!id) return;

    // Check if we're on the main transfer page (not /source or /targetBins)
    const isMainPage = !location.pathname.includes('/source') &&
                       !location.pathname.includes('/targetBins') &&
                       location.pathname.includes('/transfer/');

    if (isMainPage) {
      // Reload transfer document to get updated progress
      transferService.getProcessInfo(id)
        .then((result) => setInfo(result))
        .catch((error) => setError(error));
    }
  }, [id, location.pathname, setError]);

  // Add item handler
  const handleAddItem = useCallback((type: SourceTarget, value: AddItemValue) => {
    if (id == null) return;

    setIsProcessingItem(true);
    const item = value.item;
    const unit = value.unit;

    const params: AddItemParameters = {
      id,
      itemCode: item.code,
      barcode: item.barcode,
      type,
      binEntry: binLocation?.entry,
      unit
    };

    transferService.addItem(params, t)
      .then((v) => {
        if (v.errorMessage != null) {
          setError(v.errorMessage);
          return;
        }

        const date = new Date(Date.now());
        setCurrentAlert({
          lineId: v.lineId,
          quantity: v.quantity ?? 1,
          unit: unit,
          purPackUn: v.packUnit,
          purPackMsr: v.packMsr,
          numInBuy: v.numIn,
          buyUnitMsr: v.unitMsr,
          barcode: item.barcode,
          itemCode: item.code,
          severity: "Information",
          timeStamp: dateTimeFormat(date)
        });

        barcodeRef?.current?.clear();
        loadRows(type, binLocation?.entry);
        barcodeRef?.current?.focus();

        setTimeout(() => {
          processAlertRef?.current?.scrollIntoView({behavior: "smooth", block: "start"});
        }, 100);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => setIsProcessingItem(false));
  }, [id, binLocation?.entry, t, dateTimeFormat, setError, loadRows]);

  // Add package handler
  const handleAddPackage = useCallback((type: SourceTarget, value: PackageValue) => {
    if (id == null) return;

    setIsProcessingItem(true);

    const params = type === SourceTarget.Source
      ? {transferId: id, packageId: value.id, binEntry: binLocation?.entry} as TransferAddSourcePackageRequest
      : {transferId: id, packageId: value.id, targetBinEntry: binLocation?.entry} as TransferAddTargetPackageRequest;

    const addPackageMethod = type === SourceTarget.Source
      ? transferService.addSourcePackage
      : transferService.addTargetPackage;

    addPackageMethod(params)
      .then((r) => {
        if (r.errorMessage != null) {
          setError(r.errorMessage);
          return;
        }

        const date = new Date(Date.now());
        setCurrentAlert({
          lineId: r.lineId,
          severity: "Information",
          timeStamp: dateTimeFormat(date),
          package: value,
          packageContents: r.packageContents,
        });

        barcodeRef?.current?.clear();
        loadRows(type, binLocation?.entry);
        barcodeRef?.current?.focus();

        setTimeout(() => {
          processAlertRef?.current?.scrollIntoView({behavior: "smooth", block: "start"});
        }, 100);
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          const errorMessage = error.response?.data?.error;
          if (errorMessage === "Package is already added as source to this transfer") {
            setError(t('packageAlreadyAddedAsSource', {barcode: value.barcode}));
            return;
          }
        }
        setError(error);
      })
      .finally(() => setIsProcessingItem(false));
  }, [id, binLocation?.entry, t, dateTimeFormat, setError, loadRows]);

  // Quantity changed handler
  const handleQuantityChanged = useCallback((quantity: number) => {
    if (currentAlert == null) return;

    setCurrentAlert({
      ...currentAlert,
      quantity: quantity,
    });

    // Reload rows after quantity change is accepted
    const path = window.location.pathname;
    const type = path.includes('/source') ? SourceTarget.Source : SourceTarget.Target;
    loadRows(type, binLocation?.entry);
  }, [currentAlert, loadRows, binLocation?.entry]);

  // Cancel handler
  const handleCancel = useCallback((comment: string, cancel: boolean) => {
    if (currentAlert == null) return;

    setCurrentAlert({
      ...currentAlert,
      comment: comment,
      canceled: cancel,
    });

    // Reload rows after cancel
    const path = window.location.pathname;
    const type = path.includes('/source') ? SourceTarget.Source : SourceTarget.Target;
    loadRows(type, binLocation?.entry);
  }, [currentAlert, loadRows, binLocation?.entry]);

  // Finish operation (for main process page)
  const finish = useCallback(() => {
    if (!info?.isComplete || id == null) return;

    if (window.confirm(StringFormat(t("createTransferConfirm"), info?.number))) {
      setIsLoadingState(true);
      transferService.process(id)
        .then((result) => {
          if (result.success) {
            toast.success(t("transferApproved"));
            navigate(`/transfer`);
          }
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => setIsLoadingState(false));
    }
  }, [info, id, t, navigate, setError]);

  const value: TransferProcessContextType = {
    id,
    scanCode,
    info,
    binLocation,
    onBinChanged,
    onBinClear,
    rows,
    loadRows,
    currentAlert,
    handleQuantityChanged,
    handleCancel,
    isProcessingItem,
    handleAddItem,
    handleAddPackage,
    barcodeRef,
    processesRef,
    processAlertRef,
    user,
    isLoading: isLoadingState,
    enable,
    setEnable,
    finish,
  };

  return (
    <TransferProcessContext value={value}>
      {children}
    </TransferProcessContext>
  );
};

export const useTransferProcess = () => {
  const context = useContext(TransferProcessContext);
  if (context === undefined) {
    throw new Error("useTransferProcess must be used within a TransferProcessProvider");
  }
  return context;
};
