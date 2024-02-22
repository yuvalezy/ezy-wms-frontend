import ContentTheme from "../../Components/ContentTheme";
import {Link, useParams} from "react-router-dom";
import React, {CSSProperties, MouseEventHandler, useEffect, useRef, useState} from "react";
import {useThemeContext} from "../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Grid, Icon, Input, InputDomRef, Label, MessageStrip, Table, TableCell, TableColumn, TableRow} from "@ui5/webcomponents-react";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {useAuth} from "../../Components/AppContext";
import {BinLocation, distinctItems, Item} from "../../Assets/Common";
import BarCodeScanner, {BarCodeScannerRef} from "../../Components/BarCodeScanner";
import {TransferBinContent} from "./Data/Transfer";
import BinLocationScanner from "../../Components/BinLocationScanner";
import {delay} from "../../Assets/GlobalConfig";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {fetchCountingContent} from "../Counting/Data/Counting";
import {scanBarcode} from "../../Assets/ScanBarcode";
import {addItem} from "../Counting/Data/CountingProcess";
import ProcessAlert, {AlertActionType, ProcessAlertValue} from "../../Components/ProcessAlert";

export default function TransferProcessTarget() {
    const {scanCode} = useParams();
    const {t} = useTranslation();
    const [id, setID] = useState<number | null>();
    const [binLocation, setBinLocation] = useState<BinLocation | null>(null);
    const [enable, setEnable] = useState(false);
    const {setLoading, setAlert} = useThemeContext();
    const {user} = useAuth();
    const barcodeRef = useRef<BarCodeScannerRef>(null);
    const [rows, setRows] = useState<TransferBinContent[] | null>(null);
    const [currentAlert, setCurrentAlert] = useState<ProcessAlertValue | null>(null);

    const title = `${t("transfer")} #${scanCode} - ${t("selectTargetBin")}`;


    return (
        <ContentTheme title={title} icon="functional-location">
            {id &&
                <div>Hello World</div>
            }
        </ContentTheme>
    );
}
