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
import {updateLine} from "../Data/CountingProcess";
import {UpdateLineReturnValue} from "../../../Assets/Common";

export interface ProcessQuantityRef {
    show: (show: boolean) => void;
}

export interface ProcessQuantityProps {
    id: number;
    alert: ProcessAlertValue | null;
    onAccept: (quantity: number) => void;
}

const ProcessQuantity = forwardRef((props: ProcessQuantityProps, ref) => {
    const {t} = useTranslation();
    const {setLoading, setAlert} = useThemeContext();
    const [quantity, setQuantity] = useState<number>(props.alert?.quantity ?? 1);
    const QuantityRef = useRef<InputDomRef>(null);
    const dialogRef = useRef<DialogDomRef>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        updateLine({
            id: props.id,
            lineID: props.alert?.lineID ?? -1,
            quantity: quantity,
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
                }
                if (message !== null) {
                    setAlert({message: t('duplicateNotAllowed'), type: MessageStripDesign.Negative});
                    setLoading(false);
                    setTimeout(() => QuantityRef.current?.focus(), 100);
                    return;
                }

                props.onAccept(quantity);
                dialogRef?.current?.close();
                setLoading(false);
            })
            .catch((error) => {
                console.error(`Error performing update: ${error}`);
                let errorMessage = error.response?.data["exceptionMessage"] ?? `Update Line Error: ${error}`;
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
                {t("quantity")}
            </Title>
            <Title level="H6">
                <strong>{t("barcode")}: </strong>
                {props.alert?.barcode}
            </Title>
            <Title level="H6">
                <strong>{t("item")}: </strong>
                {props.alert?.itemCode}
            </Title>
            <Form onSubmit={handleSubmit}>
                <FormItem label={t("quantity")}>
                    <Input
                        required
                        name="quantity"
                        ref={QuantityRef}
                        type="Number"
                        id="quantity"
                        value={quantity?.toString()}
                        onChange={function (e) {
                            let value = e.target.value as string;
                            return setQuantity(value.length > 0 ? parseInt(value) : 1);
                        }}
                    ></Input>
                </FormItem>
            </Form>
        </Dialog>
    );
});
export default ProcessQuantity;
