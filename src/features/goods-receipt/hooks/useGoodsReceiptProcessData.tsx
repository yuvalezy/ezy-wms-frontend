import {useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {useEffect, useRef, useState} from "react";
import {AddItemValue, BarCodeScannerRef, PackageValue} from "@/components/BarCodeScanner";
import {BoxConfirmationDialogRef} from "@/components/BoxConfirmationDialog";
import {useThemeContext} from "@/components/ThemeContext";
import {
  AddItemResponseMultipleValue, ProcessType,
  UpdateLineParameters,
  UpdateLineReturnValue
} from "@/features/shared/data/shared";
import {AlertActionType, AlertSeverity, ProcessAlertValue} from "@/components/ProcessAlert";
import {ProcessesRef} from "@/components/Processes";
import {StringFormat} from "@/utils/string-utils";
import {DocumentAddItemResponse, ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {goodsReceiptService} from "@/features/goods-receipt/data/goods-receipt-service";

export const useGoodsReceiptProcessData = (processType: ProcessType) => {
  const {scanCode} = useParams();
  const {t} = useTranslation();
  const {dateTimeFormat} = useDateTimeFormat();
  const barcodeRef = useRef<BarCodeScannerRef>(null);
  const boxConfirmationDialogRef = useRef<BoxConfirmationDialogRef>(null);
  const [enable, setEnable] = useState(true);
  const {setError} = useThemeContext();
  const [acceptValues, setAcceptValues] = useState<ProcessAlertValue[]>([]);
  const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
  const processesRef = useRef<ProcessesRef>(null);
  const [info, setInfo] = useState<ReceiptDocument | null>(null);
  const [currentPackage, setCurrentPackage] = useState<PackageValue | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => barcodeRef.current?.focus(), 1);
    if (scanCode === null || scanCode === undefined) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    goodsReceiptService.fetch(scanCode)
      .then((result) => setInfo(result))
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, []);

  const alert = (alert: ProcessAlertValue) => {
    let date = new Date(Date.now());
    alert.timeStamp = dateTimeFormat(date);
    setAcceptValues([alert, ...acceptValues]);
  };

  function handleAddItem(value: AddItemValue) {
    const item = value.item;
    const unit = value.unit;
    boxConfirmationDialogRef?.current?.show(false);
    barcodeRef.current?.clear();
    let barcode = item.barcode!;
    goodsReceiptService.addItem(info!.id, item.code, barcode, unit, value.createPackage, value.package?.id)
      .then((data) => {
        if (isClosedDocument(data, item.code, barcode)) {
          return;
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

        const newAlert: ProcessAlertValue = {
          lineId: data.lineId,
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
          unit: unit,
          customFields: data.customFields,
          package: data.packageId ? {id: data.packageId, barcode: data.packageBarcode!} : value.package
        };
        alert(newAlert);
        setCurrentPackage(data.packageId ? {id: data.packageId, barcode: data.packageBarcode!} : value.package)

        // If we created a new package, clear the createPackage checkbox
        if (data.packageId && value.createPackage) {
          setTimeout(() => barcodeRef.current?.focus(), 100);
        }
      })
      .catch((error) => {
        let errorMessage = `${error}`
        if (errorMessage.includes('Item was not found in any of the source documents')) {
          errorMessage = t('itemNotFoundInSource');
        } else {
          errorMessage = error.response?.data["exceptionMessage"] ?? `Add Item Error: ${error}`;
        }
        alert({barcode: barcode, itemCode: item.code, message: errorMessage, severity: "Negative"});
      })
      .finally(function () {
        setTimeout(() => barcodeRef.current?.focus(), 100);
      });
  }

  function isClosedDocument(data: DocumentAddItemResponse, itemCode: string, barcode: string): boolean {
    if (!data.closedDocument) {
      return false;
    }
    alert({
      lineId: data.lineId,
      barcode: barcode,
      itemCode: itemCode,
      message: StringFormat(t("goodsReceiptIsClosed"), info?.number),
      severity: "Negative",
      multiple: [],
      quantity: data.quantity
    });
    setEnable(false);
    return true;
  }

  function alertAction(alert: ProcessAlertValue, type: AlertActionType) {
    setCurrentAlert(alert);
    setTimeout(() => {
      processesRef?.current?.open(type);
    }, 1);
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

    let index = acceptValues.findIndex((v) => v.lineId === currentAlert.lineId);
    let newAcceptValues = [...acceptValues];
    if (index !== -1) {
      newAcceptValues[index] = updatedAlert;
    } else {
      newAcceptValues.push(updatedAlert);
    }

    setAcceptValues(newAcceptValues);
    setCurrentAlert(null);
  }


  function handleUpdateLine(parameters: UpdateLineParameters): Promise<{
    returnValue: UpdateLineReturnValue,
    errorMessage?: string
  }> {
    if (parameters.quantity == null) {
      return goodsReceiptService.updateLine(parameters);
    }
    return new Promise((resolve, reject) => {
      try {
        let response = UpdateLineReturnValue.Ok;
        let error;
        if (currentAlert == null) {
          return;
        }

        const updatedAlert: ProcessAlertValue = {...currentAlert};
        goodsReceiptService.updateLineQuantity({
          id: parameters.id,
          lineId: parameters.lineId,
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

            let index = acceptValues.findIndex((v) => v.lineId === currentAlert.lineId);
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
        resolve({returnValue: response});

      } catch (error) {
        setError(error);
        reject(error);
      }
    });
  }

  return {
    scanCode,
    info,
    enable,
    isLoading,
    barcodeRef,
    processesRef,
    acceptValues,
    currentAlert,
    handleAddItem,
    alertAction,
    handleAlertActionAccept,
    handleUpdateLine,
    currentPackage,
    setCurrentPackage,
  }
}