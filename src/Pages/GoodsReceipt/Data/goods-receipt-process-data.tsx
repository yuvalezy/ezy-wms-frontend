import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useDateTimeFormat} from "@/assets/DateFormat";
import {useEffect, useRef, useState} from "react";
import {BarCodeScannerRef} from "@/components/BarCodeScanner";
import {BoxConfirmationDialogRef} from "@/components/BoxConfirmationDialog";
import {useThemeContext} from "@/components/ThemeContext";
import {
  AddItemResponseMultipleValue,
  Item,
  UnitType,
  UpdateLineParameters,
  UpdateLineReturnValue
} from "@/assets/Common";
import {AlertActionType, AlertSeverity, ProcessAlertValue} from "@/components/ProcessAlert";
import {ProcessesRef} from "@/components/Processes";
import {IsNumeric, StringFormat} from "@/assets/Functions";
import {addItem, updateLine, updateLineQuantity} from "@/pages/GoodsReceipt/data/GoodsReceiptProcess";
import {configUtils, delay} from "@/assets/GlobalConfig";
import {DocumentAddItemResponse} from "@/assets/Document";

export const useGoodsReceiptProcessData = (confirm: boolean) => {
  const {scanCode} = useParams();
  const {t} = useTranslation();
  const {dateTimeFormat} = useDateTimeFormat();
  const barcodeRef = useRef<BarCodeScannerRef>(null);
  const boxConfirmationDialogRef = useRef<BoxConfirmationDialogRef>(null);
  const [id, setID] = useState<number | null>();
  const [enable, setEnable] = useState(true);
  const {setLoading, setError} = useThemeContext();
  const [acceptValues, setAcceptValues] = useState<ProcessAlertValue[]>([]);
  const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
  const processesRef = useRef<ProcessesRef>(null);

  const title = `${!confirm ? t("goodsReceipt") : t("receiptConfirmation")} #${scanCode}`;

  useEffect(() => {
    setTimeout(() => barcodeRef.current?.focus(), 1);
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      setID(null);
      return;
    }
    setID(parseInt(scanCode));
  }, []);

  const alert = (alert: ProcessAlertValue) => {
    let date = new Date(Date.now());
    alert.timeStamp = dateTimeFormat(date);
    setAcceptValues([alert, ...acceptValues]);
  };

  function handleAddItem(item: Item, unit: UnitType) {
    addItemToDocument(item, unit);
    // setLoading(true);
    // scanBarcode(barcodeInput)
    //   .then((items) => handleItems(items))
    //   .catch((error) => {
    //     setError(error);
    //     setLoading(false);
    //   });
  }

  // function handleItems(items: Item[]) {
  //   if (items.length === 0) {
  //     alert({
  //       barcode: barcodeInput,
  //       message: StringFormat(t("barcodeNotFound"), barcodeInput),
  //       severity: StatusAlertType.Negative,
  //     });
  //     setBarcodeInput("");
  //     setLoading(false);
  //     return;
  //   }
  //   if (items.length === 1) {
  //     addItemToDocument(items[0].code);
  //     return;
  //   }
  //   handleMultipleItems(items);
  // }


  function addItemToDocument(item: Item, unit: UnitType) {
    boxConfirmationDialogRef?.current?.show(false);
    barcodeRef.current?.clear();
    setLoading(true);
    let barcode = item.barcode!;
    addItem(id ?? 0, item.code, barcode, unit)
      .then((data) => {
        if (isClosedDocument(data, item.code, barcode)) {
          return;
        }

        if (configUtils.isMockup && !data.fulfillment && !data.warehouse && !data.showroom) {
          return alert({
            barcode: barcode,
            itemCode: item.code,
            quantity: data.quantity,
            message: `Error Mockup`,
            severity: "Negative"
          });
        }

        let message: string = "";
        let color: AlertSeverity = "Information";
        let multiple: AddItemResponseMultipleValue[] = [];
        let totalErrors = (data.warehouse ? 1 : 0) + (data.fulfillment ? 1 : 0) + (data.showroom ? 1 : 0);
        if (totalErrors === 1) {
          if (data.warehouse) {
            message = t("scanConfirmStoreInWarehouse");
            color = "Positive";
          }
          if (data.fulfillment) {
            message = t("scanConfirmFulfillment");
            color = "Warning";
          }
          if (data.showroom) {
            message = t("scanConfirmShowroom");
            color = "Information";
          }
        } else {
          if (data.warehouse) {
            multiple.push({message: t("scanConfirmStoreInWarehouse"), severity: "Positive"});
          }
          if (data.fulfillment) {
            multiple.push({message: t("scanConfirmFulfillment"), severity: "Warning"});
          }
          if (data.showroom) {
            multiple.push({message: t("scanConfirmShowroom"), severity: "Information"});
          }
        }

        alert({
          lineID: data.lineID,
          barcode,
          itemCode: item.code,
          message,
          severity: color,
          multiple,
          quantity: data.quantity,
          numInBuy: data.numInBuy,
          buyUnitMsr: data.buyUnitMsr,
          purPackUn: data.purPackUn,
          purPackMsr: data.purPackMsr,
          unit: unit
        });
      })
      .catch((error) => {
        console.error(`Error performing action: ${error}`);
        let errorMessage = error.response?.data["exceptionMessage"] ?? `Add Item Error: ${error}`;
        alert({barcode: barcode, itemCode: item.code, message: errorMessage, severity: "Negative"});
      })
      .finally(function () {
        setLoading(false);
        setTimeout(() => barcodeRef.current?.focus(), 100);
      });
  }

  function isClosedDocument(data: DocumentAddItemResponse, itemCode: string, barcode: string): boolean {
    if (!data.closedDocument) {
      return false;
    }
    alert({
      lineID: data.lineID,
      barcode: barcode,
      itemCode: itemCode,
      message: StringFormat(t("goodsReceiptIsClosed"), id),
      severity: "Negative",
      multiple: [],
      quantity: data.quantity
    });
    setEnable(false);
    return true;
  }

  function alertAction(alert: ProcessAlertValue, type: AlertActionType) {
    setCurrentAlert(alert);
    delay(1).then(() => processesRef?.current?.open(type));
  }

  function handleAlertActionAccept(type: AlertActionType, value?: string | number, cancel?: boolean): void {
    if (currentAlert == null) {
      return;
    }

    const updatedAlert: ProcessAlertValue = {...currentAlert};

    switch (type) {
      case AlertActionType.Cancel:
        updatedAlert.comment = value as string;
        updatedAlert.canceled = cancel ?? false;
        break;
      case AlertActionType.Comments:
        updatedAlert.comment = value as string;
        break;
      case AlertActionType.Quantity:
        updatedAlert.quantity = value as number;
        break;
    }

    let index = acceptValues.findIndex((v) => v.lineID === currentAlert.lineID);
    let newAcceptValues = [...acceptValues];
    if (index !== -1) {
      newAcceptValues[index] = updatedAlert;
    } else {
      newAcceptValues.push(updatedAlert);
    }

    setAcceptValues(newAcceptValues);
    setCurrentAlert(null);
  }


  function handleUpdateLine(parameters: UpdateLineParameters): Promise<UpdateLineReturnValue> {
    if (parameters.quantity == null) {
      return updateLine(parameters);
    }
    return new Promise((resolve, reject) => {
      try {
        let response = UpdateLineReturnValue.Ok;
        let error;
        if (currentAlert == null) {
          return;
        }

        const updatedAlert: ProcessAlertValue = {...currentAlert};
        updateLineQuantity({
          id: id ?? -1,
          lineID: parameters.lineID,
          userName: parameters.userName,
          quantity: parameters.quantity
        })
          .then((data) => {
            response = data.returnValue;
            error = data.errorMessage;
            let message: string = "";
            let color: AlertSeverity = "Information";
            let multiple: AddItemResponseMultipleValue[] = [];
            let totalErrors = (data.warehouse ? 1 : 0) + (data.fulfillment ? 1 : 0) + (data.showroom ? 1 : 0);
            if (totalErrors === 1) {
              if (data.warehouse) {
                message = t("scanConfirmStoreInWarehouse");
                color = "Positive";
              }
              if (data.fulfillment) {
                message = t("scanConfirmFulfillment");
                color = "Warning";
              }
              if (data.showroom) {
                message = t("scanConfirmShowroom");
                color = "Information";
              }
            } else {
              if (data.warehouse) {
                multiple.push({message: t("scanConfirmStoreInWarehouse"), severity: "Positive"});
              }
              if (data.fulfillment) {
                multiple.push({message: t("scanConfirmFulfillment"), severity: "Warning"});
              }
              if (data.showroom) {
                multiple.push({message: t("scanConfirmShowroom"), severity: "Information"});
              }
            }
            updatedAlert.quantity = parameters.quantity;
            updatedAlert.multiple = multiple;
            updatedAlert.message = message;
            updatedAlert.severity = color;

            let index = acceptValues.findIndex((v) => v.lineID === currentAlert.lineID);
            let newAcceptValues = [...acceptValues];
            if (index !== -1) {
              newAcceptValues[index] = updatedAlert;
            } else {
              newAcceptValues.push(updatedAlert);
            }

            setAcceptValues(newAcceptValues);
            setCurrentAlert(null);
          });
        if (error != null) {
          setError(error);
          reject(error);
          return;
        }
        resolve(response);

      } catch (error) {
        setError(error);
        reject(error);
      }
    });
  }

  return {
    title,
    id,
    enable,
    barcodeRef,
    processesRef,
    acceptValues,
    currentAlert,
    handleAddItem,
    alertAction,
    handleAlertActionAccept,
    handleUpdateLine
  }
}