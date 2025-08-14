import React, {useCallback, useEffect, useRef} from "react";
import {useThemeContext} from "@/components/ThemeContext";
import {StringFormat} from "@/utils/string-utils";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {ItemCheckResponse, ResponseStatus} from "@/features/items/data/items";
import {itemsService} from "@/features/items/data/items-service";
import {useAuth} from "@/components";
import {ScannerMode} from "@/features/login/data/login";

export const useItemCheckData = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [itemCodeInput, setItemCodeInput] = React.useState("");
  const [result, setResult] = React.useState<ItemCheckResponse[] | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isSettingBarcode, setIsSettingBarcode] = React.useState(false);
  const {setLoading, setError} = useThemeContext();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCodeFocus();
  }, [barcodeInputRef, codeInputRef]);

  const setCodeFocus = () => {
    if (user!.settings.scannerMode === ScannerMode.ItemCode) {
      setTimeout(() => codeInputRef?.current?.focus(), 1);
      return;
    }
    setTimeout(() => barcodeInputRef?.current?.focus(), 1);
  }

  function handleCheckSubmit(emptyAlert: boolean = true) {
    let barcodeLength = barcodeInput.length === 0;
    let itemCodeLength = itemCodeInput.length === 0;
    if (barcodeLength && itemCodeLength) {
      if (emptyAlert)
        toast.warning(t("barcodeOrItemRequired"));
      return;
    }

    setIsChecking(true);
    executeItemCheck(itemCodeInput, barcodeInput);
  }

  const executeItemCheck = useCallback((itemCode: string, barCode: string) => {
    itemsService.itemCheck(itemCode, barCode)
      .then((items) => {
        setResult(items);
        if (items.length === 0) {
          toast.error(t("noDataFound"));
          setBarcodeInput("");
          setItemCodeInput("");
          setResult(null);
          setCodeFocus();
        }
      })
      .catch((error) => setError(error))
      .finally(() => {
        setIsChecking(false);
        setIsSettingBarcode(false);
        setIsUpdating(false);
      });
  }, [setError, t]);

  function handleUpdateSubmit(itemCode: string, checkedBarcodes: string[], newBarcode: string) {
    setIsUpdating(true);
    executeUpdateItemBarcode(itemCode, checkedBarcodes, newBarcode);
  }

  function executeUpdateItemBarcode(
    itemCode: string,
    checkedBarcodes: string[],
    newBarcode: string
  ) {
    itemsService.updateItemBarCode(itemCode, checkedBarcodes, newBarcode)
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
          setIsUpdating(false);
        }
      })
      .catch((error) => {
        setError(error);
        setIsUpdating(false);
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
    setIsSettingBarcode(true);
    try {
      for (let i = 0; i < result.length; i++) {
        if (i === index) {
          continue;
        }
        await itemsService.updateItemBarCode(
          result[i].itemCode,
          [barcodeInput],
          ""
        );
      }
      executeItemCheck(itemCode, "");
    } catch (error) {
      setError(error);
      setIsSettingBarcode(false);
    }
  }

  function handleClear() {
    setItemCodeInput("");
    setBarcodeInput("");
    setResult(null);
  }

  return {
    barcodeInput,
    setBarcodeInput,
    itemCodeInput,
    setItemCodeInput,
    result,
    setResult,
    barcodeInputRef,
    codeInputRef,
    isChecking,
    isUpdating,
    isSettingBarcode,
    handleCheckSubmit,
    executeItemCheck,
    handleUpdateSubmit,
    executeUpdateItemBarcode,
    handleSetBarcodeItem,
    handleClear
  }
}
