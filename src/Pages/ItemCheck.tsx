import ContentTheme from "../Components/ContentTheme";
import React, {MutableRefObject, useEffect, useRef} from "react";
import { useLoading } from "../Components/LoadingContext";
import {
  itemCheck,
  ItemCheckResponse,
  updateItemBarCode,
} from "./ItemCheck/Item";
import { ResponseStatus } from "../assets/Common";
import { StringFormat } from "../assets/Functions";
import ItemCheckMultipleResult from "./ItemCheck/ItemCheckMultipleResult";
import ItemCheckResult from "./ItemCheck/ItemCheckResult";
import { useTranslation } from "react-i18next";
import {
  Button,
  Form,
  FormItem,
  Icon,
  Input, InputDomRef,
  MessageStrip,
} from "@ui5/webcomponents-react";

export default function ItemCheck() {
  const { t } = useTranslation();
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [itemCodeInput, setItemCodeInput] = React.useState("");
  const [result, setResult] = React.useState<ItemCheckResponse[] | null>(null);
  const { setLoading } = useLoading();
  const barcodeInputRef = useRef<InputDomRef>(null);

  useEffect(() => {
    setTimeout(() => barcodeInputRef.current?.focus(), 1);
  }, []);

  function handleCheckSubmit() {
    let barcodeLength = barcodeInput.length === 0;
    let itemCodeLength = itemCodeInput.length === 0;
    if (barcodeLength && itemCodeLength) {
      window.alert(t("barcodeOrItemRequired"));
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
      .catch((error) =>
        window.alert({
          message: `Item Check Error: ${error}`,
          severity: "error",
        })
      )
      .finally(() => setLoading(false));
  }

  function handleUpdateSubmit(checkedBarcodes: string[], newBarcode: string) {
    setLoading(true);
    executeUpdateItemBarcode(itemCodeInput, checkedBarcodes, newBarcode);
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
          if (response.existItem != null) {
            window.alert(
              `Barcode ${newBarcode} already exists for item ${response.existItem}`
            );
          } else {
            window.alert(response.errorMessage ?? "Unknown error");
          }
          setLoading(false);
        }
      })
      .catch((error) => {
        window.alert(`Item Check Error: ${error}`);
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

  return (
    <ContentTheme title={t("itemCheck")} icon="complete">
      {(result == null || result.length === 0) && (
        <Form>
          <FormItem label={t("barcode")}>
            <Input
              required={itemCodeInput.length === 0}
              disabled={itemCodeInput.length > 0}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value as string)}
              ref={barcodeInputRef}
            />
          </FormItem>
          <FormItem label={t("code")}>
            <Input
              required={barcodeInput.length === 0}
              disabled={barcodeInput.length > 0}
              value={itemCodeInput}
              onChange={(e) => setItemCodeInput(e.target.value as string)}
            />
          </FormItem>
          <FormItem>
            <Button onClick={() => handleCheckSubmit()} color="primary">
              <Icon name="accept" />
              {t("accept")}
            </Button>
          </FormItem>
        </Form>
      )}
      {result && (
        <>
          <br />
          {result.length === 0 && (
            <MessageStrip design="Negative" hideCloseButton>
              {t("noDataFound")}
            </MessageStrip>
          )}
          {result.length === 1 && (
            <ItemCheckResult
              result={result[0]}
              clear={handleClear}
              submit={handleUpdateSubmit}
            />
          )}
          {result.length > 1 && (
            <ItemCheckMultipleResult
              barcode={barcodeInput}
              result={result}
              clear={handleClear}
              setBarcodeItem={handleSetBarcodeItem}
            />
          )}
        </>
      )}
    </ContentTheme>
  );
}
