import React, {useEffect, useRef} from "react";
import {itemCheck, ItemCheckResponse, updateItemBarCode} from "@/pages/ItemCheck/Item";
import {useThemeContext} from "@/components/ThemeContext";
import {ResponseStatus} from "@/assets/Common";
import {StringFormat} from "@/assets/Functions";
import {useTranslation} from "react-i18next";
import { toast } from "sonner";

export const useItemCheckData = () => {
  const {t} = useTranslation();
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [itemCodeInput, setItemCodeInput] = React.useState("");
  const [result, setResult] = React.useState<ItemCheckResponse[] | null>(null);
  const {setLoading, setError} = useThemeContext();
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => barcodeInputRef.current?.focus(), 1);
  }, []);

  function handleCheckSubmit() {
    let barcodeLength = barcodeInput.length === 0;
    let itemCodeLength = itemCodeInput.length === 0;
    if (barcodeLength && itemCodeLength) {
      toast.warning(t("barcodeOrItemRequired"));
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
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  function handleUpdateSubmit(itemCode: string, checkedBarcodes: string[], newBarcode: string) {
    setLoading(true);
    executeUpdateItemBarcode(itemCode, checkedBarcodes, newBarcode);
  }

  function executeUpdateItemBarcode(
    itemCode: string,
    checkedBarcodes: string[],
    newBarcode: string
  ) {
    updateItemBarCode(itemCode, checkedBarcodes, newBarcode)
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
          setLoading(false);
        }
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
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
    setLoading(true);
    for (let i = 0; i < result.length; i++) {
      if (i === index) {
        continue;
      }
      await updateItemBarCode(
        result[i].itemCode,
        [barcodeInput],
        ""
      );
    }
    executeItemCheck(itemCode, "");
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
    handleCheckSubmit,
    executeItemCheck,
    handleUpdateSubmit,
    executeUpdateItemBarcode,
    handleSetBarcodeItem,
    handleClear
  }
}
