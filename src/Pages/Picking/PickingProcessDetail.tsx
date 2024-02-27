import ContentTheme from "../../Components/ContentTheme";
import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import BoxConfirmationDialog, {BoxConfirmationDialogRef} from "../../Components/BoxConfirmationDialog";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Title, Table, TableColumn, Label, TableRow, TableCell} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {Item} from "../../Assets/Common";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {addItem, fetchPicking, PickingDocument, PickingDocumentDetail} from "./Data/PickingDocument";
import {useObjectName} from "../../Assets/ObjectName";
import BarCodeScanner, {BarCodeScannerRef} from "../../Components/BarCodeScanner";
import {ScrollableContent} from "../../Components/ScrollableContent";
import PickingProcessDetailContent from "./Components/PickingProcessDetailContent";

export default function PickingProcessDetail() {
    const {idParam, typeParam, entryParam} = useParams();
    const [id, setID] = useState<number | null>();
    const [type, setType] = useState<number | null>();
    const [entry, setEntry] = useState<number | null>();
    const [title, setTitle] = useState("");
    const {t} = useTranslation();
    const boxConfirmationDialogRef = useRef<BoxConfirmationDialogRef>(null);
    const [enable, setEnable] = useState(true);
    const {setLoading, setAlert, setError} = useThemeContext();
    const [boxItem, setBoxItem] = useState("");
    const [boxItems, setBoxItems] = useState<Item[]>();
    const [, setPicking] = useState<PickingDocument | null>(null);
    const [detail, setDetail] = useState<PickingDocumentDetail | null>(null);
    const o = useObjectName();
    const navigate = useNavigate();
    const barcodeRef = useRef<BarCodeScannerRef>(null);


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

        fetchPicking(id, type, entry, true)
            .then(value => {
                if (value == null) {
                    setPicking(null);
                    setError(t("pickingNotFound"))
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
                    setTimeout(() => barcodeRef?.current?.focus(), 1);
                }
            })
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }


    function handleAddItem(itemCode: string, barcode: string) {
        boxConfirmationDialogRef?.current?.show(false);
        barcodeRef?.current?.clear();
        if (id == null || type == null || entry == null) {
            return;
        }
        setLoading(true);
        addItem(id, type, entry, itemCode, 1)
            .then((data) => {
                if (data.closedDocument) {
                    setError(StringFormat(t("pickedIsClosed"), id));
                    setEnable(false);
                    return;
                }

                setAlert({message: StringFormat(t("pickingProcessSuccess"), barcode), type: MessageStripDesign.Positive})
                loadData(true);
            })
            .catch((error) => {
                console.error(`Error performing action: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"] ?? `Add Item Error: ${error}`;
                setError(errorMessage);
                setLoading(false);
                setTimeout(() => barcodeRef.current?.focus(), 100);
            });
    }

    function navigateBack() {
        navigate(`/pick/${id}`);
    }

    return (
        <ContentTheme title={title} icon="cause" back={() => navigateBack()}>
            {detail &&
                <ScrollableContent>
                    <div>
                        <Title level="H5">
                            <strong>{t("customer")}: </strong>
                            {detail.cardCode} - {detail.cardName}
                        </Title>
                    </div>
                    <PickingProcessDetailContent items={detail.items} />
                    {detail.totalOpenItems > 0 && <BarCodeScanner ref={barcodeRef} onAddItem={handleAddItem} enabled={enable}/>}
                    <BoxConfirmationDialog
                        onSelected={(itemCode: string) => handleAddItem(itemCode, barcodeRef?.current?.getValue() ?? "")}
                        ref={boxConfirmationDialogRef}
                        itemCode={boxItem}
                        items={boxItems}
                    />
                </ScrollableContent>
            }
        </ContentTheme>
    );
}
