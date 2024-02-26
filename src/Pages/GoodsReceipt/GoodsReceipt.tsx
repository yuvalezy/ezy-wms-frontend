import React, {useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import ContentTheme from "../../Components/ContentTheme";
import { fetchDocuments, } from "./Data/Document";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Input, InputDomRef, MessageStripDesign} from "@ui5/webcomponents-react";
import {useThemeContext} from "../../Components/ThemeContext";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {useDocumentStatusToString} from "../../Assets/DocumentStatusString";
import {Status} from "../../Assets/Common";

export default function GoodsReceipt() {
    const {setLoading, setAlert, setError} = useThemeContext();
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
                    setAlert({message: StringFormat(t("goodsReceiptNotFound"), id), type: MessageStripDesign.Warning});
                    return;
                }
                const status = doc[0].status;

                if (status !== Status.Open && status !== Status.InProgress) {
                    setAlert({message: StringFormat(
                        t("goodsReceiptStatusError"),
                        id,
                        documentStatusToString(status)
                      ), type: MessageStripDesign.Warning});
                    return;
                }
                navigate(`/goodsReceipt/${id}`);
            })
            .catch((error) => setError(error))
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
                    <Button type="Submit" icon="accept">
                        {t("accept")}
                    </Button>
                </FormItem>
            </Form>
        )
    }
}
