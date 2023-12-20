import React, {useRef, useState, forwardRef, useImperativeHandle} from "react";
import {
    Bar,
    Button,
    Dialog, DialogDomRef,
    Title,
    TextArea, ComboBox, ComboBoxItem, Form, Input, InputDomRef, FormItem, MessageStripDesign
} from "@ui5/webcomponents-react";
import {ProcessAlertValue} from "./ProcessAlert";
import {useThemeContext} from "../../../Components/ThemeContext";
import { fetchReasons, ReasonValue, } from "../Data/Document";
import {useTranslation} from "react-i18next";
import {updateLine} from "../Data/GoodsReceiptProcess";
import {UpdateLineReturnValue} from "../../../Assets/Document";

export interface ProcessCancelRef {
    show: (show: boolean) => void;
}

export interface ProcessCancelProps {
    id: number;
    alert: ProcessAlertValue | null;
    onAccept: (comment: string, cancel: boolean) => void;
}

const ProcessCancel = forwardRef((props: ProcessCancelProps, ref) => {
    const {t} = useTranslation();
    const {setLoading, setAlert} = useThemeContext();
    const [comment, setComment] = useState(props.alert?.comment || "");
    const [userName, setUserName] = useState("");
    const [reason, setReason] = useState<ReasonValue | null>(null);
    const [reasons, setReasons] = useState<ReasonValue[]>([]);
    const usernameRef = useRef<InputDomRef>(null);
    const dialogRef = useRef<DialogDomRef>(null);

    function errorAlert(message: string) {
        setAlert({message: message, type: MessageStripDesign.Negative})
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        updateLine({
            id: props.id,
            lineID: props.alert?.lineID ?? -1,
            comment: comment,
            userName: userName,
            reason: reason?.value ?? -1,
        })
            .then((value) => {
                let message: string | null = null;
                switch (value) {
                    case UpdateLineReturnValue.Status:
                        message = t("updateLineStatusError");
                        break;
                    case UpdateLineReturnValue.LineStatus:
                        message = t("updateLineLineStatusError");
                        break;
                    case UpdateLineReturnValue.CloseReason:
                        message = t("updateLineReason");
                        break;
                    case UpdateLineReturnValue.SupervisorPassword:
                        message = t("updateLineWrongSupervisorPassword");
                        break;
                    case UpdateLineReturnValue.NotSupervisor:
                        message = t("updateLineNotSupervisorError");
                        break;
                }
                if (message !== null) {
                    errorAlert(message);
                    setUserName("");
                    setLoading(false);
                    setTimeout(() => usernameRef.current?.focus(), 100);
                    return;
                }
                props.onAccept(comment, true);
                dialogRef?.current?.close();
                setLoading(false);
            })
            .catch((error) => {
                console.error(`Error performing update: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"];
                if (errorMessage) errorAlert(errorMessage);
                else errorAlert(`Update Line Error: ${error}`);
                setLoading(false);
            });
    }

    useImperativeHandle(ref, () => ({
        show(show: boolean) {
            if (show) {
                setLoading(true);
                fetchReasons()
                    .then((reasons) => {
                        setReasons(reasons);
                        dialogRef?.current?.show();
                    })
                    .catch((error) => {
                        console.error(`Error loading reasons: ${error}`);
                        let errorMessage = error.response?.data["exceptionMessage"];
                        if (errorMessage) errorAlert(errorMessage);
                        else errorAlert(`Error loading reasons: ${error}`);
                    })
                    .finally(() => setLoading(false));
            } else {
                dialogRef?.current?.close();
            }
        }
    }))

    return (
        <Dialog
            className="footerPartNoPadding"
            ref={dialogRef}
            footer={
                <Bar
                    design="Footer"
                    startContent={
                        <Button onClick={handleSubmit}>
                            {t("accept")}
                        </Button>
                    }
                    endContent={
                        <Button design="Negative" onClick={() => dialogRef?.current?.close()}>
                            {t("cancel")}
                        </Button>
                    }
                />
            }
        >
            <Title level="H5">
                {t("cancel")}
            </Title>
            <Title level="H6">
                <strong>{t("barcode")}: </strong>
                {props.alert?.barcode}
            </Title>
            <Form onSubmit={handleSubmit}>
                <FormItem label={t("comment")}>
                    <TextArea
                        style={{minHeight: "100px", width: "100%"}}
                        rows={5}
                        value={comment}
                        onInput={(e) => setComment(e.target.value as string)}
                    />

                </FormItem>
                <FormItem label={t("supervisorCode")}>
                    <Input
                        required
                        name="username"
                        ref={usernameRef}
                        type="Password"
                        id="username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value as string)}
                    ></Input>
                </FormItem>
                <FormItem label={t("reason")}>
                    <ComboBox
                        onSelectionChange={(e) =>
                            setReason(
                                reasons[Array.from(e.target.children).indexOf(e.detail.item)]
                            )
                        }
                    >
                        {reasons.map((reason) => (
                            <ComboBoxItem key={reason.value} text={reason.description}/>
                        ))}
                    </ComboBox>
                </FormItem>
            </Form>
        </Dialog>
    );
});
export default ProcessCancel;
