import React, {useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Icon, Input, InputDomRef, MessageStripDesign} from "@ui5/webcomponents-react";
import {useThemeContext} from "../../Components/ThemeContext";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {fetchPickings, PickStatus} from "./Data/PickingDocument";

export default function Picking() {
    const {setLoading, setAlert, setError} = useThemeContext();
    const [scanCodeInput, setScanCodeInput] = React.useState("");
    const {t} = useTranslation();
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
            (checkScan[0] !== "PCK" && checkScan[0] !== "$PCK") ||
            !IsNumeric(checkScan[1])
        ) {
            setAlert({message: t("invalidScanCode"), type: MessageStripDesign.Warning});
            return;
        }
        const id = parseInt(checkScan[1]);
        setLoading(true);
        fetchPickings({id: id})
            .then((pick) => {
                if (pick.length === 0) {
                    setAlert({message: t("pickingNotFound"), type: MessageStripDesign.Warning});
                    return;
                }
                const status = pick[0].status;

                if (status !== PickStatus.Released) {
                    setAlert({message: StringFormat(
                        t("pickingStatusError"),
                        id,
                        status
                      ), type: MessageStripDesign.Warning});
                    return;
                }
                navigate(`/pick/${id}`);
            })
            .catch((error) => setError(error))
            .finally(() => setLoading(false));
    }

    return (
        <ContentTheme title={t("picking")} icon="cause">
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
