import ContentTheme from "../../Components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {CSSProperties, useEffect, useRef, useState} from "react";
import BoxConfirmationDialog, {BoxConfirmationDialogRef} from "../../Components/BoxConfirmationDialog";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Icon, Form, FormItem, Input, InputDomRef, Title, Table, TableColumn, Label, TableRow, TableCell} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {distinctItems, Item} from "../../Assets/Common";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {addItem, fetchPicking, PickingDocument, PickingDocumentDetail} from "./Data/PickingDocument";
import {useObjectName} from "../../Assets/ObjectName";
import {scanBarcode} from "../../Assets/ScanBarcode";

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
        loadData();
    }, [id, type, entry]);

    function loadData(reload = false) {
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
                    if (reload) {
                        if (valueDetail.totalOpenItems === 0) {
                            navigateBack();
                            return;
                        }
                    }
                    setTimeout(() => barcodeRef.current?.focus(), 1);
                }
            })
            .catch(error => errorAlert(error))
            .finally(() => setLoading(false));
    }

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
        let barcode = barcodeInput;
        setBarcodeInput("");
        if (id == null || type == null || entry == null) {
            return;
        }
        setLoading(true);
        addItem(id, type, entry, itemCode, 1)
            .then((data) => {
                if (data.closedDocument) {
                    errorAlert(StringFormat(t("pickedIsClosed"), id));
                    setEnable(false);
                    return;
                }

                setAlert({message: StringFormat(t("pickingProcessSuccess"), barcode), type: MessageStripDesign.Positive})
                loadData(true);
            })
            .catch((error) => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"] ?? `Add Item Error: ${error}`;
                errorAlert(errorMessage);
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

    function navigateBack() {
        navigate(`/pick/${id}`);
    }

    return (
        <ContentTheme title={title} icon="cause" back={() => navigateBack()}>
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
                                <TableRow key={row.itemCode} className={row.openQuantity === 0 ? 'completed-row' : ''}>
                                    <TableCell><Label>{row.itemCode}</Label></TableCell>
                                    <TableCell><Label>{row.itemName}</Label></TableCell>
                                    <TableCell><Label>{row.quantity}</Label></TableCell>
                                    <TableCell><Label>{row.picked}</Label></TableCell>
                                    <TableCell><Label>{row.openQuantity}</Label></TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    </div>
                    {detail.totalOpenItems > 0 &&
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
                                    <Button type="Submit" disabled={!enable} icon="accept">{t("accept")}</Button>
                                </FormItem>
                            </Form>
                        </div>
                    }
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
