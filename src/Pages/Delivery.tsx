import React, {useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import ContentTheme from "../Components/ContentTheme";
import { fetchDocuments, } from "./GoodsReceiptSupervisor/Document";
import {useTranslation} from "react-i18next";
import {useDocumentStatusToString} from "./GoodsReceiptSupervisor/DocumentStatusString";
import {Button, Form, FormItem, Icon, Input, InputDomRef, MessageStripDesign} from "@ui5/webcomponents-react";
import {useThemeContext} from "../Components/ThemeContext";
import {IsNumeric, StringFormat} from "../Assets/Functions";
import {DocumentStatus} from "../Assets/Document";

export default function Delivery() {
    const {setLoading, setAlert} = useThemeContext();
    const [scanCodeInput, setScanCodeInput] = React.useState("");
    const {t} = useTranslation();
    const documentStatusToString = useDocumentStatusToString();
    const scanCodeInputRef = useRef<InputDomRef>(null);

    useEffect(() => {
        setTimeout(() => scanCodeInputRef?.current?.focus(), 1);
    }, []);

    const navigate = useNavigate();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (scanCodeInput.length === 0) {
            setAlert({message: t("scanCodeRequired"), type: MessageStripDesign.Warning});
            return;
        }
        let checkScan = scanCodeInput.split("_");
        if (
            checkScan.length !== 2 ||
            (checkScan[0] !== "GRPO" && checkScan[0] !== "$GRPO") ||
            !IsNumeric(checkScan[1])
        ) {
            setAlert({message: t("invalidScanCode"), type: MessageStripDesign.Warning});
            return;
        }
        const id = parseInt(checkScan[1]);
        setLoading(true);
        fetchDocuments(id, [])
            .then((doc) => {
                if (doc.length === 0) {
                    setAlert({message: t("goodsReceiptNotFound"), type: MessageStripDesign.Warning});
                    return;
                }
                const status = doc[0].status;

                if (status !== DocumentStatus.Open && status !== DocumentStatus.InProgress) {
                    setAlert({message: StringFormat(
                        t("goodsReceiptStatusError"),
                        id,
                        documentStatusToString(status)
                      ), type: MessageStripDesign.Warning});
                    return;
                }
                navigate(`/goodsReceipt/${id}`);
            })
            .catch((error) => {
                setAlert({message: `Validate Goods Receipt Error: ${error}`, type: MessageStripDesign.Negative});
            })
            .finally(() => setLoading(false));
    }

    return (
        <ContentTheme title={t("goodsReceipt")} icon="cause">
            {ScanForm()}
        </ContentTheme>
    );

    function ScanForm() {
        return (
            <Form onSubmit={handleSubmit}>
                <FormItem label={t("code")}>
                    <Input
                        value={scanCodeInput}
                        type="Password"
                        ref={scanCodeInputRef}
                        required
                        onInput={(e) => setScanCodeInput(e.target.value as string)}
                    />
                </FormItem>
                <FormItem>
                    <Button type="Submit" color="primary">
                        <Icon name="accept"/>
                        {t("accept")}
                    </Button>
                </FormItem>
            </Form>
        )
    }
}
