import React, {useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Input, InputDomRef, MessageStripDesign} from "@ui5/webcomponents-react";
import {useThemeContext} from "../../Components/ThemeContext";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {useDocumentStatusToString} from "../../Assets/DocumentStatusString";
import {fetchCountings} from "./Data/Counting";
import {Status} from "../../Assets/Common";

export default function Counting() {
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
            (checkScan[0] !== "CNT" && checkScan[0] !== "$CNT") ||
            !IsNumeric(checkScan[1])
        ) {
            setAlert({message: t("invalidScanCode"), type: MessageStripDesign.Warning});
            return;
        }
        const id = parseInt(checkScan[1]);
        setLoading(true);
        fetchCountings(id, [])
            .then((counts) => {
                if (counts.length === 0) {
                    setAlert({message: t("countingNotFound"), type: MessageStripDesign.Warning});
                    return;
                }
                const status = counts[0].status;

                if (status !== Status.Open && status !== Status.InProgress) {
                    setAlert({message: StringFormat(
                            t("countingStatusError"),
                            id,
                            documentStatusToString(status)
                        ), type: MessageStripDesign.Warning});
                    return;
                }
                navigate(`/counting/${id}`);
            })
            .catch((error) => {
                setError(error);
            })
            .finally(() => setLoading(false));
    }

    return (
        <ContentTheme title={t("counting")} icon="product">
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
