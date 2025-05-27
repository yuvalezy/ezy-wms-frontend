import ContentThemeSapUI5 from "../../components/ContentThemeSapUI5";
import {useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import BoxConfirmationDialog, {BoxConfirmationDialogRef} from "../../Components/BoxConfirmationDialog";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Input, InputDomRef, MessageStrip} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react";
import {addItem, updateLine, updateLineQuantity} from "./Data/GoodsReceiptProcess";
import {
  AddItemResponseMultipleValue,
  distinctItems,
  Item, UnitType,
  UpdateLineParameters,
  UpdateLineReturnValue
} from "../../Assets/Common";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {configUtils, delay} from "../../Assets/GlobalConfig";
import {scanBarcode} from "../../Assets/ScanBarcode";
import ProcessAlert, {AlertActionType, ProcessAlertValue} from "../../Components/ProcessAlert";
import {ReasonType} from "../../Assets/Reasons";
import {DocumentAddItemResponse} from "../../Assets/Document";
import Processes, {ProcessesRef} from "../../Components/Processes";
import {useDateTimeFormat} from "../../Assets/DateFormat";
import BarCodeScanner, {BarCodeScannerRef} from "../../Components/BarCodeScanner";

export default function GoodsReceiptProcess() {
  const {scanCode} = useParams();
  const {t} = useTranslation();
  const {dateTimeFormat} = useDateTimeFormat();
  const barcodeRef = useRef<BarCodeScannerRef>(null);
  const boxConfirmationDialogRef = useRef<BoxConfirmationDialogRef>(null);
  const [id, setID] = useState<number | null>();
  const [enable, setEnable] = useState(true);
  const {setLoading, setAlert, setError} = useThemeContext();
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const [boxItem, setBoxItem] = useState("");
  const [boxItems, setBoxItems] = useState<Item[]>();
  const [acceptValues, setAcceptValues] = useState<ProcessAlertValue[]>([]);
  const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);
  const processesRef = useRef<ProcessesRef>(null);

  const title = `${t("goodsReceipt")} #${scanCode}`;

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
  //       severity: MessageStripDesign.Negative,
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
            severity: MessageStripDesign.Negative
          });
        }

        let message: string = "";
        let color: MessageStripDesign = MessageStripDesign.Information;
        let multiple: AddItemResponseMultipleValue[] = [];
        let totalErrors = (data.warehouse ? 1 : 0) + (data.fulfillment ? 1 : 0) + (data.showroom ? 1 : 0);
        if (totalErrors === 1) {
          if (data.warehouse) {
            message = t("scanConfirmStoreInWarehouse");
            color = MessageStripDesign.Positive;
          }
          if (data.fulfillment) {
            message = t("scanConfirmFulfillment");
            color = MessageStripDesign.Warning;
          }
          if (data.showroom) {
            message = t("scanConfirmShowroom");
            color = MessageStripDesign.Information;
          }
        } else {
          if (data.warehouse) {
            multiple.push({message: t("scanConfirmStoreInWarehouse"), severity: MessageStripDesign.Positive});
          }
          if (data.fulfillment) {
            multiple.push({message: t("scanConfirmFulfillment"), severity: MessageStripDesign.Warning});
          }
          if (data.showroom) {
            multiple.push({message: t("scanConfirmShowroom"), severity: MessageStripDesign.Information});
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
        alert({barcode: barcode, itemCode: item.code, message: errorMessage, severity: MessageStripDesign.Negative});
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
      severity: MessageStripDesign.Negative,
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
            let color: MessageStripDesign = MessageStripDesign.Information;
            let multiple: AddItemResponseMultipleValue[] = [];
            let totalErrors = (data.warehouse ? 1 : 0) + (data.fulfillment ? 1 : 0) + (data.showroom ? 1 : 0);
            if (totalErrors === 1) {
              if (data.warehouse) {
                message = t("scanConfirmStoreInWarehouse");
                color = MessageStripDesign.Positive;
              }
              if (data.fulfillment) {
                message = t("scanConfirmFulfillment");
                color = MessageStripDesign.Warning;
              }
              if (data.showroom) {
                message = t("scanConfirmShowroom");
                color = MessageStripDesign.Information;
              }
            } else {
              if (data.warehouse) {
                multiple.push({message: t("scanConfirmStoreInWarehouse"), severity: MessageStripDesign.Positive});
              }
              if (data.fulfillment) {
                multiple.push({message: t("scanConfirmFulfillment"), severity: MessageStripDesign.Warning});
              }
              if (data.showroom) {
                multiple.push({message: t("scanConfirmShowroom"), severity: MessageStripDesign.Information});
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

  return (
    <ContentThemeSapUI5 title={title} icon="cause">
      {id ? (
        <>
          {enable && (
            // <Form onSubmit={handleSubmit}>
            //     <FormItem label={t("barcode")}>
            //         <Input required
            //                value={barcodeInput}
            //                onInput={(e) => setBarcodeInput(e.target.value as string)}
            //                ref={barcodeRef}
            //                disabled={!enable}
            //         ></Input>
            //     </FormItem>
            //     <FormItem>
            //         <Button type="Submit" icon="accept" disabled={!enable}>
            //             {t("accept")}
            //         </Button>
            //     </FormItem>
            // </Form>
            <BarCodeScanner ref={barcodeRef} enabled unit onAddItem={handleAddItem}/>
          )}
          {acceptValues.map((alert) => (
            <ProcessAlert
              enableComment={true}
              alert={alert}
              key={alert.lineID}
              onAction={(type) => alertAction(alert, type)}
            />
          ))}
          {currentAlert && id &&
              <Processes ref={processesRef} id={id} alert={currentAlert} reasonType={ReasonType.GoodsReceipt}
                         onCancel={(comment, cancel) => handleAlertActionAccept(AlertActionType.Cancel, comment, cancel)}
                         onCommentsChanged={(comment) => handleAlertActionAccept(AlertActionType.Comments, comment)}
                         onQuantityChanged={(quantity) => handleAlertActionAccept(AlertActionType.Quantity, quantity)}
                         supervisorPassword={configUtils.grpoModificationSupervisor}
                         onUpdateLine={handleUpdateLine}/>}
          {/*<BoxConfirmationDialog*/}
          {/*  onSelected={(v: string) => addItemToDocument(v)}*/}
          {/*  ref={boxConfirmationDialogRef}*/}
          {/*  itemCode={boxItem}*/}
          {/*  items={boxItems}*/}
          {/*/>*/}
        </>
      ) : (
        <MessageStrip design="Negative">{t("invalidScanCode")}</MessageStrip>
      )}
    </ContentThemeSapUI5>
  );
}
