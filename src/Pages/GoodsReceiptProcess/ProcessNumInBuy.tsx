import React, {useRef, useState, forwardRef, useImperativeHandle} from "react";
import {
    Bar,
    Button,
    Dialog, DialogDomRef,
    Title,
    Form, Input, InputDomRef, FormItem, MessageStripDesign
} from "@ui5/webcomponents-react";
import {ProcessAlertValue} from "./ProcessAlert";
import {useThemeContext} from "../../Components/ThemeContext";
import {UpdateLineReturnValue} from "../GoodsReceiptSupervisor/Document";
import {updateLine} from "./Process";
import {useTranslation} from "react-i18next";

export interface ProcessNumInBuyRef {
    show: (show: boolean) => void;
}

export interface ProcessNumInBuyProps {
    id: number;
    alert: ProcessAlertValue | null;
    onAccept: (numInBuy: number) => void;
}

const ProcessNumInBuy = forwardRef((props: ProcessNumInBuyProps, ref) => {
    const {t} = useTranslation();
    const {setLoading, setAlert} = useThemeContext();
    const [userName, setUserName] = useState("");
    const [numInBuy, setNumInBuy] = useState<number>(props.alert?.numInBuy ?? 1);
    const numInBuyRef = useRef<InputDomRef>(null);
    const dialogRef = useRef<DialogDomRef>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        updateLine({
            id: props.id,
            lineID: props.alert?.lineID ?? -1,
            numInBuy: numInBuy,
            userName: userName,
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
                    setAlert({message: t('duplicateNotAllowed'), type: MessageStripDesign.Negative});
                    setUserName("");
                    setLoading(false);
                    setTimeout(() => numInBuyRef.current?.focus(), 100);
                    return;
                }

                props.onAccept(numInBuy);
                dialogRef?.current?.close();
                setLoading(false);
            })
            .catch((error) => {
                console.error(`Error performing update: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"]??`Update Line Error: ${error}`;
                setAlert({message: errorMessage, type: MessageStripDesign.Negative});
                setLoading(false);
            });
    }

    useImperativeHandle(ref, () => ({
        show(show: boolean) {
            if (show) {
                dialogRef?.current?.show();
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
                {t("numInBuy")}
            </Title>
            <Title level="H6">
                <strong>{t("barcode")}: </strong>
                {props.alert?.barcode}
            </Title>
            <Form onSubmit={handleSubmit}>
                <FormItem label={t("supervisorCode")}>
                    <Input
                        required
                        name="username"
                        type="Password"
                        id="username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value as string)}
                    ></Input>
                </FormItem>
                <FormItem label={t("numInBuy")}>
                    <Input
                        required
                        name="numInBuy"
                        ref={numInBuyRef}
                        type="Number"
                        id="numInBuy"
                        value={numInBuy?.toString()}
                        onChange={function (e) {
                            let value = e.target.value as string;
                            return setNumInBuy(value.length > 0 ? parseInt(value) : 1);
                        }}
                    ></Input>
                </FormItem>
            </Form>
        </Dialog>
    );
});
export default ProcessNumInBuy;
