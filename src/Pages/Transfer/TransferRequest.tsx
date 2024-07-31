import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {ScrollableContent, ScrollableContentBox} from "../../Components/ScrollableContent";
import BarCodeScanner, {BarCodeScannerRef} from "../../Components/BarCodeScanner";
import React, {useEffect, useRef, useState} from "react";
import {Item} from "../../Assets/Common";
import {createRequest, TransferContent} from "./Data/Transfer";
import {
    Button,
    Input,
    InputDomRef,
    Label,
    MessageStrip,
    Table,
    TableCell,
    TableColumn,
    TableRow
} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {useThemeContext} from "../../Components/ThemeContext";
import {StringFormat} from "../../Assets/Functions";
import {useNavigate} from "react-router-dom";

export default function TransferRequest() {
    const {t} = useTranslation();
    const barcodeRef = useRef<BarCodeScannerRef>(null);
    const {setLoading, setAlert, setError} = useThemeContext();
    const [rows, setRows] = useState<TransferContent[]>([]);
    const quantityRefs = useRef<(InputDomRef | null)[]>([]);
    const navigate = useNavigate();

    function handleAddItem(item: Item) {
        try {
            const duplicateItem = rows.find(row => row.code === item.code);

            if (duplicateItem) {
                setError(t('duplicateItems'));
                return;
            }

            let newRow: TransferContent = {
                code: item.code,
                quantity: 1,
                openQuantity: 0,
                name: item.name,
            }
            setRows((prevRows) => [...prevRows, newRow]);
            barcodeRef?.current?.clear();
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (rows.length === 0) {
            return;
        }
        const lastIndex = rows.length - 1;
        const lastRef = quantityRefs.current[lastIndex];
        lastRef?.focus();
    }, [rows]); // Run this effect every time rows change

    function handleQuantityChange(index: number, newQuantity: string) {
        const updatedRows = rows.map((row, i) =>
            i === index ? { ...row, quantity: parseInt(newQuantity, 10) } : row
        );
        setRows(updatedRows);
    }

    function removeRow(index: number) {
        const message = StringFormat(t('confirmRemoveItem'), rows[index].code);
        if (!window.confirm(message)) {
            return;
        }
        setRows((currentRows) => {
            const rowsCopy = [...currentRows];
            rowsCopy.splice(index, 1);
            return rowsCopy;
        });
    }

    function create() {
        try {
            setLoading(true);
            createRequest(rows)
                .then((v) => {
                    window.alert(StringFormat(t('transferRequestCreated'), v))
                    navigate('/');
                })
                .catch((e) => setError(e))
                .finally(() => setLoading(false));
        } catch (e) {
            setError(e);
        }
    }

    return (
        <ContentTheme title={t("transferRequest")} icon="request">
            <ScrollableContent>
                <ScrollableContentBox borderUp={true}>
                    {rows != null && rows.length > 0 &&
                        <>
                            <Table
                                columns={<>
                                    <TableColumn><Label>{t('code')}</Label></TableColumn>
                                    <TableColumn><Label>{t('description')}</Label></TableColumn>
                                    <TableColumn><Label>{t('quantity')}</Label></TableColumn>
                                    <TableColumn><Label></Label></TableColumn>
                                </>}
                            >
                                {rows.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Label>{row.code}</Label></TableCell>
                                        <TableCell><Label>{row.name}</Label></TableCell>
                                        <TableCell><Input type="Number" value={row.quantity.toString()}
                                                          ref={el => quantityRefs.current[index] = el}
                                                          onInput={(e) => handleQuantityChange(index, e.target.value)}
                                        /></TableCell>
                                        <TableCell><Button onClick={() => removeRow(index)} design="Negative"
                                                           icon="cancel">Remove</Button></TableCell>
                                    </TableRow>
                                ))}
                            </Table>
                            <div style={{textAlign: 'center'}}>
                                <Button onClick={() => create()}>{t('create')}</Button>
                            </div>
                        </>
                    }
                    {rows != null && rows.length === 0 &&
                        <div style={{padding: '10px'}}>
                            <MessageStrip hideCloseButton design={MessageStripDesign.Information}>
                                {t("scanItemBarCodeStart")}
                            </MessageStrip>
                        </div>
                    }
                </ScrollableContentBox>
                <BarCodeScanner ref={barcodeRef} onAddItem={handleAddItem} item={true} enabled={true}/>
            </ScrollableContent>
        </ContentTheme>
    )
}