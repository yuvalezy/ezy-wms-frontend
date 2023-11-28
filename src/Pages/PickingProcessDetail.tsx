import ContentTheme from "../Components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {CSSProperties, useEffect, useRef, useState} from "react";
import BoxConfirmationDialog, {BoxConfirmationDialogRef} from "../Components/BoxConfirmationDialog";
import {useThemeContext} from "../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Icon, Form, FormItem, Input, InputDomRef, MessageStrip, Panel, Title, Text, Table, TableColumn, Label, TableRow, TableCell} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {Item} from "../Assets/Common";
import {IsNumeric} from "../Assets/Functions";
import {configUtils} from "../Assets/GlobalConfig";
import {fetchPickings, PickingDocument, PickingDocumentDetail} from "./PickSupervisor/PickingDocument";
import {useObjectName} from "../Assets/ObjectName";

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
            console.log(`index: ${index}, value: ${p}`)
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

        fetchPickings({id: id, type: type, entry: entry})
            .then(values => {
                if (values.length === 0) {
                    setPicking(null);
                    errorAlert(t("pickingNotFound"))
                    return;
                }
                let value = values[0];
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
                                <TableColumn><Label>{t('pending')}</Label></TableColumn>
                            </>}
                        >
                            {detail.items?.map((row) => (
                                <TableRow key={row.itemCode}>
                                    <TableCell><Label>{row.itemCode}</Label></TableCell>
                                    <TableCell><Label>{row.itemName}</Label></TableCell>
                                    <TableCell><Label>{row.quantity}</Label></TableCell>
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

                </>
            }
        </ContentTheme>
    );
}
