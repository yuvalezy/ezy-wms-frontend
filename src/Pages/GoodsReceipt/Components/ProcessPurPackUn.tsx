import React, {useRef, useState, forwardRef, useImperativeHandle} from "react";
import {
    Bar,
    Button,
    Dialog, DialogDomRef,
    Title,
    Form, Input, InputDomRef, FormItem, MessageStripDesign
} from "@ui5/webcomponents-react";
import {ProcessAlertValue} from "./ProcessAlert";
import {useThemeContext} from "../../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {updateLine} from "../Data/GoodsReceiptProcess";
import {UpdateLineReturnValue} from "../../../Assets/Document";

export interface ProcessPurPackUnRef {
    show: (show: boolean) => void;
}

export interface ProcessPurPackUnProps {
    id: number;
    alert: ProcessAlertValue | null;
    onAccept: (purPackUn: number) => void;
}

const ProcessPurPackUn = forwardRef((props: ProcessPurPackUnProps, ref) => {
    const {t} = useTranslation();
    const {setLoading, setAlert} = useThemeContext();
    const [userName, setUserName] = useState("");
    const [purPackUn, setPurPackUn] = useState<number>(props.alert?.purPackUn ?? 1);
    const PurPackUnRef = useRef<InputDomRef>(null);
    const dialogRef = useRef<DialogDomRef>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        updateLine({
            id: props.id,
            lineID: props.alert?.lineID ?? -1,
            purPackUn: purPackUn,
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
                    setTimeout(() => PurPackUnRef.current?.focus(), 100);
                    return;
                }

                props.onAccept(purPackUn);
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
                {t("purPackUn")}
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
                <FormItem label={t("purPackUn")}>
                    <Input
                        required
                        name="purPackUn"
                        ref={PurPackUnRef}
                        type="Number"
                        id="purPackUn"
                        value={purPackUn?.toString()}
                        onChange={function (e) {
                            let value = e.target.value as string;
                            return setPurPackUn(value.length > 0 ? parseInt(value) : 1);
                        }}
                    ></Input>
                </FormItem>
            </Form>
        </Dialog>
    );
});
export default ProcessPurPackUn;
