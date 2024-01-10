import ContentTheme from "../../Components/ContentTheme";
import {useParams} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import BoxConfirmationDialog, {BoxConfirmationDialogRef} from "../../Components/BoxConfirmationDialog";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Input, InputDomRef, MessageStrip} from "@ui5/webcomponents-react";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {distinctItems, Item} from "../../Assets/Common";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {configUtils} from "../../Assets/GlobalConfig";
import {AddItemResponseMultipleValue} from "../../Assets/Document";
import {scanBarcode} from "../../Assets/ScanBarcode";
import {useAuth} from "../../Components/AppContext";

export default function CountingProcess() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const barcodeRef = useRef<InputDomRef>(null);
    const boxConfirmationDialogRef = useRef<BoxConfirmationDialogRef>(null);
    const [id, setID] = useState<number | null>();
    const [enable, setEnable] = useState(true);
    const {setLoading, setAlert} = useThemeContext();
    const [barcodeInput, setBarcodeInput] = React.useState("");
    const {user } = useAuth();

    const title = `${t("counting")} #${scanCode}`;

    useEffect(() => {
        setTimeout(() => barcodeRef.current?.focus(), 1);
        if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
            setID(null);
            return;
        }
        setID(parseInt(scanCode));
    }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
            //todo
    }


    return (
        <ContentTheme title={title} icon="product">
            <span>Todo {user?.binLocations??false}</span>
            test
        </ContentTheme>
    );
}
