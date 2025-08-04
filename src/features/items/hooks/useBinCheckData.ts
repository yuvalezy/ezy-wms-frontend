import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {useRef, useState, useCallback} from "react";
import {BinLocationScannerRef} from "@/components/BinLocationScanner";
import {useAuth} from "@/components/AppContext";
import {exportToExcel} from "@/utils/excelExport";
import {getExcelQuantityHeaders, getExcelQuantityValues} from "@/utils/excel-quantity-format";

import {BinContentResponse, BinLocation} from "@/features/items/data/items";
import {itemsService} from "@/features/items/data/items-service";

export const useBinCheckData = () => {
  const {t} = useTranslation();
  const {user, unitSelection} = useAuth();
  const {setLoading, setError} = useThemeContext();
  const binRef = useRef<BinLocationScannerRef>(null);
  const [binContent, setBinContent] = useState<BinContentResponse[] | null>(null);
  const [bin, setBin] = useState<BinLocation | null>(null);

  const onScan = useCallback((bin: BinLocation) => {
    setBin(bin);
    try {
      itemsService.binCheck(bin.entry)
        .then((v) => setBinContent(v))
        .catch((error) => setError(error))
        .finally(() => setLoading(false));
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  }, [setError, setLoading]);

  const executeBinCheck = useCallback((binEntry: string, binCode: string) => {
    // Create a BinLocation object from the parameters
    const binLocation: BinLocation = {
      code: binCode,
      entry: parseInt(binEntry),
      quantity: 1
    };
    onScan(binLocation);
  }, [onScan]);

  function onBinClear() {
    setBin(null);
    setBinContent(null);
    setTimeout(() => {
      binRef?.current?.focus();
    }, 1)
  }

  const excelData = () => {
    return binContent?.map((value) => {
      const values = [
        value.itemCode,
        value.itemName,
      ];
      values.push(...getExcelQuantityValues({
        quantity: value.onHand,
        numInBuy: value.numInBuy,
        purPackUn: value.purPackUn,
      }, unitSelection, user?.settings.enableUseBaseUn));
      return values;
    }) ?? [];
  };

  const getExcelHeaders = () => {
    const headers = [
      t("code"),
      t("description"),
    ];
    headers.push(...getExcelQuantityHeaders(t, unitSelection, user?.settings.enableUseBaseUn));
    return headers;
  }

  const handleExportExcel = () => {
    exportToExcel({
      name: "BinCheck",
      headers: getExcelHeaders,
      getData: excelData,
      fileName: `bincheck_${binRef?.current?.getBin()}`
    });
  };

  return {
    setLoading,
    setError,
    binRef,
    user,
    binContent,
    setBinContent,
    onScan,
    onBinClear,
    excelData,
    handleExportExcel,
    bin,
    executeBinCheck
  }
}
