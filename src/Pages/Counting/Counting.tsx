import React, {useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import ContentTheme from "../../Components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Button, Form, FormItem, Input, InputDomRef, MessageStripDesign} from "@ui5/webcomponents-react";
import {useThemeContext} from "../../Components/ThemeContext";
import {IsNumeric, StringFormat} from "../../Assets/Functions";
import {DocumentStatus} from "../../Assets/Document";
import {useDocumentStatusToString} from "../../Assets/DocumentStatusString";

export default function Counting() {
    const {setLoading, setAlert} = useThemeContext();
    const [scanCodeInput, setScanCodeInput] = React.useState("");
    const {t} = useTranslation();
    const documentStatusToString = useDocumentStatusToString();
    const scanCodeInputRef = useRef<InputDomRef>(null);

    useEffect(() => {
        //todo
        // setTimeout(() => scanCodeInputRef?.current?.focus(), 1);
    }, []);

    const navigate = useNavigate();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        //todo
    }

    return (
        <ContentTheme title={t("counting")} icon="product">
            {ScanForm()}
        </ContentTheme>
    );

    function ScanForm() {
        return (
            <Form onSubmit={handleSubmit}>
                <span>Todo</span>
                {/*<FormItem label={t("code")}>*/}
                {/*    <Input*/}
                {/*        value={scanCodeInput}*/}
                {/*        type="Password"*/}
                {/*        ref={scanCodeInputRef}*/}
                {/*        required*/}
                {/*        onInput={(e) => setScanCodeInput(e.target.value as string)}*/}
                {/*    />*/}
                {/*</FormItem>*/}
                {/*<FormItem>*/}
                {/*    <Button type="Submit" icon="accept">*/}
                {/*        {t("accept")}*/}
                {/*    </Button>*/}
                {/*</FormItem>*/}
            </Form>
        )
    }
}
