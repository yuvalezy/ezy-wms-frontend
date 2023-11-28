import ContentTheme from "../Components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {CSSProperties, useEffect, useRef, useState} from "react";
import BoxConfirmationDialog, {BoxConfirmationDialogRef} from "../Components/BoxConfirmationDialog";
import {useThemeContext} from "../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Icon, Form, FormItem, Input, InputDomRef, MessageStrip, Panel, Title, Text, Table, TableColumn, Label, TableRow, TableCell} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {distinctItems, Item} from "../Assets/Common";
import {IsNumeric, StringFormat} from "../Assets/Functions";
import {configUtils} from "../Assets/GlobalConfig";
import {addItem, fetchPicking, fetchPickings, PickingDocument, PickingDocumentDetail} from "./PickSupervisor/PickingDocument";
import {useObjectName} from "../Assets/ObjectName";
import {AddItemResponseMultipleValue} from "../Assets/Document";
import {scanBarcode} from "../Assets/ScanBarcode";
import {ProcessAlertValue} from "./GoodsReceiptProcess/ProcessAlert";

export default function PickingProcessDetail() {
    const {idParam, typeParam, entryParam} = useParams();
    const [id, setID] = useState<number | null>();
    const [type, setType] = useState<number | null>();
    const [entry, setEntry] = useState<number | null>();
    const [title, setTitle] = useState("");
    const {t} = useTranslation();
    const barcodeRef = useRef<InputDomRef>(null);
    const boxConfirmationDialogRef = useRef<BoxConfirmationDialogRef>(null);
    const [enable, setEnable] = useState(true);
    const {setLoading, setAlert} = useThemeContext();
    const [barcodeInput, setBarcodeInput] = React.useState("");
    const [boxItem, setBoxItem] = useState("");
    const [boxItems, setBoxItems] = useState<Item[]>();
    const [picking, setPicking] = useState<PickingDocument | null>(null);
    const [detail, setDetail] = useState<PickingDocumentDetail | null>(null);
    const o = useObjectName();
    const navigate = useNavigate();

    function errorAlert(message: string) {
        setAlert({message: message, type: MessageStripDesign.Negative})
    }
    useEffect(() => {
        setTitle(t("picking"));
        [idParam, typeParam, entryParam].forEach((p, index) => {
            if (p === null || p === undefined || !IsNumeric(p)) {
                return;
            }
            let value = parseInt(p);
            switch (index) {
                case 0:
                    setID(value);
                    break;
                case 1:
                    setType(value);
                    break;
                case 2:
                    setEntry(value);
                    break;
            }
        });
    }, []);

    useEffect(() => {
        if (!id || !type || !entry) {
            return;
        }

        fetchPicking(id, type, entry)
            .then(value => {
                if (value == null) {
                    setPicking(null);
                    errorAlert(t("pickingNotFound"))
                    return;
                }
                setPicking(value);
                if (value.detail != null) {
                    let valueDetail = value.detail[0];
                    setDetail(valueDetail);
                    setTitle(`${t("picking")} #${id} - ${o(type)}# ${valueDetail.number}`);
                    setTimeout(() => barcodeRef.current?.focus(), 1);
                }
            })
            .catch(error => errorAlert(error))
            .finally(() => setLoading(false));
    }, [id, type, entry]);

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
                errorAlert(`Scan Bar Code Error: ${error}`);
                setLoading(false);
            });
    }
    function handleItems(items: Item[]) {
        if (items.length === 0) {
            errorAlert(StringFormat(t("barcodeNotFound"), barcodeInput));
            setBarcodeInput("");
            setLoading(false);
            return;
        }
        if (items.length === 1) {
            addItemToPicking(items[0].code);
            return;
        }
        handleMultipleItems(items);
    }
    function handleMultipleItems(items: Item[]) {
        const distinctCodes = distinctItems(items);
        if (distinctCodes.length !== 1) {
            let codes = distinctCodes.map((v) => `"${v}"`).join(", ");
            errorAlert(StringFormat(t("multipleItemsError"), codes));
            setLoading(false);
            return;
        }
        setBoxItem(distinctCodes[0]);
        setBoxItems(items);
        boxConfirmationDialogRef?.current?.show(true);
        setLoading(false);
    }
    function addItemToPicking(itemCode: string) {
        boxConfirmationDialogRef?.current?.show(false);
        const barcode = barcodeInput;
        setBarcodeInput("");
        setLoading(true);
        addItem(id ?? 0, itemCode, barcode)
            .then((data) => {
                if (data.closedDocument) {
                    errorAlert(StringFormat(t("goodsReceiptIsClosed"), id));
                    setEnable(false);
                    return;
                }

                if (configUtils.isMockup) {
                    window.alert('Add Mockup');
                    //todo mockup
                    // return alert({
                    //     barcode: barcode,
                    //     itemCode: itemCode,
                    //     purPackUn: data.purPackUn,
                    //     message: `Error Mockup`,
                    //     severity: MessageStripDesign.Negative,
                    // });
                }

                //todo process
                // let message: string = "";
                // let color: MessageStripDesign = MessageStripDesign.Information;
                // let multiple: AddItemResponseMultipleValue[] = [];
                // if (
                //     (data.warehouse ? 1 : 0) +
                //     (data.fulfillment ? 1 : 0) +
                //     (data.showroom ? 1 : 0) ===
                //     1
                // ) {
                //     if (data.warehouse) {
                //         message = t("scanConfirmStoreInWarehouse");
                //         color = MessageStripDesign.Positive;
                //     }
                //     if (data.fulfillment) {
                //         message = t("scanConfirmFulfillment");
                //         color = MessageStripDesign.Warning;
                //     }
                //     if (data.showroom) {
                //         message = t("scanConfirmShowroom");
                //         color = MessageStripDesign.Information;
                //     }
                // } else {
                //     if (data.warehouse) {
                //         multiple.push({
                //             message: t("scanConfirmStoreInWarehouse"),
                //             severity: MessageStripDesign.Positive,
                //         });
                //     }
                //     if (data.fulfillment) {
                //         multiple.push({
                //             message: t("scanConfirmFulfillment"),
                //             severity: MessageStripDesign.Warning,
                //         });
                //     }
                //     if (data.showroom) {
                //         multiple.push({
                //             message: t("scanConfirmShowroom"),
                //             severity: MessageStripDesign.Information,
                //         });
                //     }
                // }
                //
                // alert({
                //     lineID: data.lineID,
                //     barcode: barcode,
                //     itemCode: itemCode,
                //     message: message,
                //     severity: color,
                //     multiple: multiple,
                //     purPackUn: data.purPackUn,
                // });
            })
            .catch((error) => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"];
                if (errorMessage){
                    errorAlert(StringFormat(errorMessage));
                }
                else {
                    errorAlert(`Add Item Error: ${error}`);
                }
            })
            .finally(function () {
                setLoading(false);
                setTimeout(() => barcodeRef.current?.focus(), 100);
            });
    }

    const contentStyle: CSSProperties = {
        overflowY: 'auto',
        position: 'fixed',
        top: '52px',
        bottom: '136px',
        left: '0px',
        right: '0px'
    };

    return (
        <ContentTheme title={title} icon="cause" back={() => navigate(`/pick/${id}`)}>
            {
                detail &&
                <>
                    <Title level="H5">
                        <strong>{t("customer")}: </strong>
                        {detail.cardCode} - {detail.cardName}
                    </Title>
                    <div style={contentStyle}>
                        <Table
                            columns={<>
                                <TableColumn><Label>{t('code')}</Label></TableColumn>
                                <TableColumn><Label>{t('description')}</Label></TableColumn>
                                <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                                <TableColumn><Label>{t('picked')}</Label></TableColumn>
                                <TableColumn><Label>{t('pending')}</Label></TableColumn>
                            </>}
                        >
                            {detail.items?.map((row) => (
                                <TableRow key={row.itemCode}>
                                    <TableCell><Label>{row.itemCode}</Label></TableCell>
                                    <TableCell><Label>{row.itemName}</Label></TableCell>
                                    <TableCell><Label>{row.quantity}</Label></TableCell>
                                    <TableCell><Label>{row.picked}</Label></TableCell>
                                    <TableCell><Label>{row.openQuantity}</Label></TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    </div>
                    <div style={{position: 'fixed', bottom: '0px', left: '0px', right: '0px', paddingBottom: '5px', borderTop: '1px solid #ccc', backgroundColor: '#fff'}}>
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
                    </div>
                    <BoxConfirmationDialog
                        onSelected={(v: string) => addItemToPicking(v)}
                        ref={boxConfirmationDialogRef}
                        itemCode={boxItem}
                        items={boxItems}
                    />

                </>
            }
        </ContentTheme>
    );
}
