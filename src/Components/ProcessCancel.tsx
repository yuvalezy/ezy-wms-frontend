import React, {forwardRef, useImperativeHandle, useRef, useState} from "react";
import {Bar, Button, ComboBox, ComboBoxItem, Dialog, DialogDomRef, Form, FormItem, Input, InputDomRef, TextArea, Title} from "@ui5/webcomponents-react";
import {ProcessAlertValue} from "./ProcessAlert";
import {useThemeContext} from "./ThemeContext";
import {fetchReasons, ReasonType, ReasonValue,} from "../Assets/Reasons";
import {useTranslation} from "react-i18next";
import {UpdateLineParameters, UpdateLineReturnValue} from "../Assets/Common";

export interface ProcessCancelRef {
    show: (show: boolean) => void;
}

export interface ProcessCancelProps {
    id: number;
    alert: ProcessAlertValue | null;
    supervisorPassword?: boolean;
    reasonType: ReasonType;
    onAccept: (comment: string, cancel: boolean) => void;
    updateLine: (parameters: UpdateLineParameters) => Promise<UpdateLineReturnValue>;
    updateComplete?: () => void;
}

const ProcessCancel = forwardRef((props: ProcessCancelProps, ref) => {
    const {t} = useTranslation();
    const {setLoading, setError} = useThemeContext();
    const [comment, setComment] = useState(props.alert?.comment || "");
    const [userName, setUserName] = useState("");
    const [reason, setReason] = useState<ReasonValue | null>(null);
    const [reasons, setReasons] = useState<ReasonValue[]>([]);
    const usernameRef = useRef<InputDomRef>(null);
    const dialogRef = useRef<DialogDomRef>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        props.updateLine({
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
                    setError(message);
                    setUserName("");
                    setLoading(false);
                    setTimeout(() => usernameRef.current?.focus(), 100);
                    return;
                }
                props.onAccept(comment, true);
                dialogRef?.current?.close();
                if (props.updateComplete == null) {
                    setLoading(false);
                } else {
                    props.updateComplete();
                }
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }

    useImperativeHandle(ref, () => ({
        show(show: boolean) {
            if (show) {
                setComment("");
                setReason(null);
                setUserName("");
                setLoading(true);
                fetchReasons(props.reasonType)
                    .then((reasons) => {
                        setReasons(reasons);
                        dialogRef?.current?.show();
                    })
                    .catch((error) => {
                        setError(error);
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
            {props.alert?.barcode &&
            <Title level="H6">
                <strong>{t("barcode")}: </strong>
                {props.alert?.barcode}
            </Title>
            }
            <Title level="H6">
                <strong>{t("item")}: </strong>
                {props.alert?.itemCode}
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
                {(props.supervisorPassword??false) &&
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
                }
                <FormItem label={t("reason")}>
                    <ComboBox
                        value={reason?.description?.toString()??""}
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
