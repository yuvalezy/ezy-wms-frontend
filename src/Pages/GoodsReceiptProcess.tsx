import ContentTheme from "../Components/ContentTheme";
import {useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import {IsNumeric, StringFormat} from "../assets/Functions";
import BoxConfirmationDialog, {BoxConfirmationDialogRef} from "../Components/BoxConfirmationDialog";
import {scanBarcode} from "./GoodsReceiptSupervisor/Document";
import {distinctItems, Item} from "../assets/Common";
import ProcessAlert, {AlertActionType, ProcessAlertValue,} from "./GoodsReceiptProcess/ProcessAlert";
import ProcessComment, {ProcessCommentRef} from "./GoodsReceiptProcess/ProcessComment";
import {useThemeContext} from "../Components/ThemeContext";
import ProcessCancel, {ProcessCancelRef} from "./GoodsReceiptProcess/ProcessCancel";
import {addItem, AddItemResponseMultipleValue,} from "./GoodsReceiptProcess/Process";
import ProcessNumInBuy, {ProcessNumInBuyRef} from "./GoodsReceiptProcess/ProcessNumInBuy";
import {useTranslation} from "react-i18next";
import {getMockupConfig} from "../assets/GlobalConfig";
import {Button, Icon, Form, FormItem, Input, InputDomRef, MessageStrip} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";

export default function GoodsReceiptProcess() {
    const isMockup = getMockupConfig();
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
    const processCancelRef = useRef<ProcessCancelRef>(null);
    const processCommentRef = useRef<ProcessCommentRef>(null);
    const processNumInBuyRef = useRef<ProcessNumInBuyRef>(null);

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
                if (data.closedDocument) {
                    alert({
                        lineID: data.lineID,
                        barcode: barcode,
                        itemCode: itemCode,
                        message: StringFormat(t("goodsReceiptIsClosed"), id),
                        severity: MessageStripDesign.Negative,
                        multiple: [],
                        numInBuy: data.numInBuy,
                    });
                    setEnable(false);
                    return;
                }

                if (isMockup && !data.fulfillment && !data.warehouse && !data.showroom) {
                    return alert({
                        barcode: barcode,
                        itemCode: itemCode,
                        numInBuy: data.numInBuy,
                        message: `Error Mockup`,
                        severity: MessageStripDesign.Negative,
                    });
                }

                let message: string = "";
                let color: MessageStripDesign = MessageStripDesign.Information;
                let multiple: AddItemResponseMultipleValue[] = [];
                if (
                    (data.warehouse ? 1 : 0) +
                    (data.fulfillment ? 1 : 0) +
                    (data.showroom ? 1 : 0) ===
                    1
                ) {
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
                        multiple.push({
                            message: t("scanConfirmStoreInWarehouse"),
                            severity: MessageStripDesign.Positive,
                        });
                    }
                    if (data.fulfillment) {
                        multiple.push({
                            message: t("scanConfirmFulfillment"),
                            severity: MessageStripDesign.Warning,
                        });
                    }
                    if (data.showroom) {
                        multiple.push({
                            message: t("scanConfirmShowroom"),
                            severity: MessageStripDesign.Information,
                        });
                    }
                }

                alert({
                    lineID: data.lineID,
                    barcode: barcode,
                    itemCode: itemCode,
                    message: message,
                    severity: color,
                    multiple: multiple,
                    numInBuy: data.numInBuy,
                });
            })
            .catch((error) => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"];
                if (errorMessage)
                    alert({
                        barcode: barcode,
                        itemCode: itemCode,
                        message: errorMessage,
                        severity: MessageStripDesign.Negative,
                    });
                else
                    alert({
                        barcode: barcode,
                        itemCode: itemCode,
                        message: `Add Item Error: ${error}`,
                        severity: MessageStripDesign.Negative,
                    });
            })
            .finally(function () {
                setLoading(false);
                setTimeout(() => barcodeRef.current?.focus(), 100);
            });
    }

    function alertAction(alert: ProcessAlertValue, type: AlertActionType) {
        setCurrentAlert(alert);
        switch (type) {
            case AlertActionType.Cancel:
                processCancelRef?.current?.show(true);
                break;
            case AlertActionType.Comments:
                processCommentRef?.current?.show(true);
                break;
            case AlertActionType.NumInBuy:
                processNumInBuyRef?.current?.show(true);
                break;
        }
    }

    function handleAlertActionAccept(newAlert: ProcessAlertValue): void {
        if (currentAlert == null) {
            return;
        }
        let index = acceptValues.findIndex((v) => v.lineID === currentAlert.lineID);
        let newAcceptValues = acceptValues.filter(
            (v) => v.lineID !== currentAlert.lineID
        );
        newAcceptValues.splice(index, 0, newAlert);
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
                                <Button
                                    type="Submit"
                                    color="primary"
                                    disabled={!enable}
                                >
                                    <Icon name="accept"/>
                                    {t("accept")}
                                </Button>
                            </FormItem>
                        </Form>
                    )}
                    <>
                        {acceptValues.map((alert) => (
                            <ProcessAlert
                                alert={alert}
                                key={alert.lineID}
                                onAction={(type) => alertAction(alert, type)}
                            />
                        ))}
                    </>
                    <ProcessCancel
                        id={id}
                        alert={currentAlert}
                        ref={processCancelRef}
                        onAccept={(comment, cancel) => {
                            if (currentAlert == null)
                                return;
                            handleAlertActionAccept({
                                ...currentAlert,
                                comment: comment,
                                canceled: cancel,
                            });
                        }}
                    />
                    <ProcessComment
                        id={id}
                        alert={currentAlert}
                        ref={processCommentRef}
                        onAccept={(comment) => {
                            if (currentAlert == null)
                                return;
                            handleAlertActionAccept({
                                ...currentAlert,
                                comment: comment,
                            });

                        }}
                    />
                    <ProcessNumInBuy
                        id={id}
                        alert={currentAlert}
                        ref={processNumInBuyRef}
                        onAccept={(numInBuy) => {
                            if (currentAlert == null)
                                return;
                            handleAlertActionAccept({
                                ...currentAlert,
                                numInBuy: numInBuy,
                            });
                        }}
                    />
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
