import ContentTheme from "../../Components/ContentTheme";
import {useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import BoxConfirmationDialog, {BoxConfirmationDialogRef} from "../../Components/BoxConfirmationDialog";
import ProcessComment, {ProcessCommentRef} from "../../Components/ProcessComment";
import {useThemeContext} from "../../Components/ThemeContext";
import ProcessCancel, {ProcessCancelRef} from "../../Components/ProcessCancel";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Input, InputDomRef, MessageStrip} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {addItem, updateLine} from "./Data/GoodsReceiptProcess";
import {AddItemResponseMultipleValue, distinctItems, Item} from "../../Assets/Common";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {configUtils, delay} from "../../Assets/GlobalConfig";
import {scanBarcode} from "../../Assets/ScanBarcode";
import ProcessAlert, {AlertActionType, ProcessAlertValue} from "../../Components/ProcessAlert";
import {ReasonType} from "../../Assets/Reasons";
import ProcessQuantity, {ProcessQuantityRef} from "../../Components/ProcessQuantity";
import {DocumentAddItemResponse} from "../../Assets/Document";
import Processes, {ProcessesRef} from "../../Components/Processes";
import processes from "../../Components/Processes";

export default function GoodsReceiptProcess() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const barcodeRef = useRef<InputDomRef>(null);
    const boxConfirmationDialogRef = useRef<BoxConfirmationDialogRef>(null);
    const [id, setID] = useState<number | null>();
    const [enable, setEnable] = useState(true);
    const {setLoading, setAlert} = useThemeContext();
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
        alert.timeStamp =
            date.toLocaleDateString() + " " + date.toLocaleTimeString();
        setAcceptValues([alert, ...acceptValues]);
    };

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (barcodeInput.length === 0) {
            setAlert({message: t("barcodeRequired"), type: MessageStripDesign.Warning});
            return;
        }

        setLoading(true);
        scanBarcode(barcodeInput)
            .then((items) => handleItems(items))
            .catch((error) => {
                alert({message: `Scan Bar Code Error: ${error}`, severity: MessageStripDesign.Negative});
                setLoading(false);
            });
    }

    function handleItems(items: Item[]) {
        if (items.length === 0) {
            alert({
                barcode: barcodeInput,
                message: StringFormat(t("barcodeNotFound"), barcodeInput),
                severity: MessageStripDesign.Negative,
            });
            setBarcodeInput("");
            setLoading(false);
            return;
        }
        if (items.length === 1) {
            addItemToDocument(items[0].code);
            return;
        }
        handleMultipleItems(items);
    }

    function handleMultipleItems(items: Item[]) {
        const distinctCodes = distinctItems(items);
        if (distinctCodes.length !== 1) {
            let codes = distinctCodes.map((v) => `"${v}"`).join(", ");
            alert({
                message: StringFormat(t("multipleItemsError"), codes),
                severity: MessageStripDesign.Negative,
            });
            setLoading(false);
            return;
        }
        setBoxItem(distinctCodes[0]);
        setBoxItems(items);
        boxConfirmationDialogRef?.current?.show(true);
        setLoading(false);
    }


    function addItemToDocument(itemCode: string) {
        boxConfirmationDialogRef?.current?.show(false);
        const barcode = barcodeInput;
        setBarcodeInput("");
        setLoading(true);
        addItem(id ?? 0, itemCode, barcode)
            .then((data) => {
                if (isClosedDocument(data, itemCode, barcode)) {
                    return;
                }

                if (configUtils.isMockup && !data.fulfillment && !data.warehouse && !data.showroom) {
                    return alert({barcode: barcode, itemCode: itemCode, quantity: data.quantity, message: `Error Mockup`, severity: MessageStripDesign.Negative});
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

                alert({lineID: data.lineID, barcode: barcode, itemCode: itemCode, message: message, severity: color, multiple: multiple, quantity: data.quantity});
            })
            .catch((error) => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"] ?? `Add Item Error: ${error}`;
                alert({barcode: barcode, itemCode: itemCode, message: errorMessage, severity: MessageStripDesign.Negative});
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

        const updatedAlert: ProcessAlertValue = { ...currentAlert };

        switch (type) {
            case AlertActionType.Cancel:
                updatedAlert.comment = value as string;
                updatedAlert.canceled = cancel??false;
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


    return (
        <ContentTheme title={title} icon="cause">
            {id ? (
                <>
                    {enable && (
                        <Form onSubmit={handleSubmit}>
                            <FormItem label={t("barcode")}>
                                <Input required
                                       value={barcodeInput}
                                       onInput={(e) => setBarcodeInput(e.target.value as string)}
                                       ref={barcodeRef}
                                       disabled={!enable}
                                ></Input>
                            </FormItem>
                            <FormItem>
                                <Button type="Submit" icon="accept" disabled={!enable}>
                                    {t("accept")}
                                </Button>
                            </FormItem>
                        </Form>
                    )}
                    {acceptValues.map((alert) => (
                        <ProcessAlert
                            enableComment={true}
                            alert={alert}
                            key={alert.lineID}
                            onAction={(type) => alertAction(alert, type)}
                        />
                    ))}
                    {currentAlert && id && <Processes ref={processesRef} id={id} alert={currentAlert} reasonType={ReasonType.GoodsReceipt}
                                                      onCancel={(comment, cancel) => handleAlertActionAccept(AlertActionType.Cancel, comment, cancel)}
                                                      onCommentsChanged={(comment) => handleAlertActionAccept(AlertActionType.Comments, comment)}
                                                      onQuantityChanged={(quantity) => handleAlertActionAccept(AlertActionType.Quantity, quantity)}
                                                      supervisorPassword={configUtils.grpoModificationSupervisor}
                                                      onUpdateLine={updateLine}/>}
                    <BoxConfirmationDialog
                        onSelected={(v: string) => addItemToDocument(v)}
                        ref={boxConfirmationDialogRef}
                        itemCode={boxItem}
                        items={boxItems}
                    />
                </>
            ) : (
                <MessageStrip design="Negative">{t("invalidScanCode")}</MessageStrip>
            )}
        </ContentTheme>
    );
}
