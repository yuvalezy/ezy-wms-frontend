import React, {useRef, useState, forwardRef, useImperativeHandle} from "react";
import {
    Bar,
    Button,
    Dialog, DialogDomRef,
    Title,
    Form, Input, InputDomRef, FormItem, MessageStripDesign
} from "@ui5/webcomponents-react";
import {useThemeContext} from "../../../Components/ThemeContext";
import {useTranslation} from "react-i18next";
import {UpdateLineReturnValue} from "../../../Assets/Document";

export interface QuantityPopupProperties {
    barcode: string,
    itemCode: string,
    quantity?: number
}

export interface QuantityPopupRef {
    show: (properties: QuantityPopupProperties) => void;
    hide: () => void;
}

export interface QuantityPopupProps {
    onAccept: (properties: QuantityPopupProperties) => void;
}

const QuantityPopup = forwardRef((props: QuantityPopupProps, ref) => {
    const {t} = useTranslation();
    const {setLoading, setAlert} = useThemeContext();
    const [properties, setProperties] = useState<QuantityPopupProperties | null>(null);
    // const [userName, setUserName] = useState("");
    const [qty, setQty] = useState<number>(1);
    const qtyRef = useRef<InputDomRef>(null);
    const dialogRef = useRef<DialogDomRef>(null);
    //
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
    //     setLoading(true);
    //     updateLine({
    //         id: props.id,
    //         lineID: props.alert?.lineID ?? -1,
    //         purPackUn: purPackUn,
    //         userName: userName,
    //     })
    //         .then((value) => {
    //             let message: string | null = null;
    //             switch (value) {
    //                 case UpdateLineReturnValue.Status:
    //                     message = t("updateLineStatusError");
    //                     break;
    //                 case UpdateLineReturnValue.LineStatus:
    //                     message = t("updateLineLineStatusError");
    //                     break;
    //                 case UpdateLineReturnValue.CloseReason:
    //                     message = t("updateLineReason");
    //                     break;
    //                 case UpdateLineReturnValue.SupervisorPassword:
    //                     message = t("updateLineWrongSupervisorPassword");
    //                     break;
    //                 case UpdateLineReturnValue.NotSupervisor:
    //                     message = t("updateLineNotSupervisorError");
    //                     break;
    //             }
    //             if (message !== null) {
    //                 setAlert({message: t('duplicateNotAllowed'), type: MessageStripDesign.Negative});
    //                 setUserName("");
    //                 setLoading(false);
    //                 setTimeout(() => PurPackUnRef.current?.focus(), 100);
    //                 return;
    //             }
    //
    //             props.onAccept(purPackUn);
    //             dialogRef?.current?.close();
    //             setLoading(false);
    //         })
    //         .catch((error) => {
    //             console.error(`Error performing update: ${error}`);
    //             let errorMessage = error.response?.data["exceptionMessage"]??`Update Line Error: ${error}`;
    //             setAlert({message: errorMessage, type: MessageStripDesign.Negative});
    //             setLoading(false);
    //         });
    }

    useImperativeHandle(ref, () => ({
        show(properties: QuantityPopupProperties) {
            setProperties(properties);
            dialogRef?.current?.show();
        },
        hide() {
            dialogRef?.current?.close();
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
                <strong>{t("barcode")}: </strong>
                {properties?.barcode}
            </Title>
            <Title level="H6">
                <strong>{t("item")}: </strong>
                {properties?.itemCode}
            </Title>
            <Form onSubmit={handleSubmit}>
                <FormItem label={t("quantity")}>
                    <Input
                        required
                        name="quantity"
                        ref={qtyRef}
                        type="Number"
                        id="purPackUn"
                        value={qty?.toString()}
                        onChange={function (e) {
                            let value = e.target.value as string;
                            return setQty(value.length > 0 ? parseInt(value) : 1);
                        }}
                    ></Input>
                </FormItem>
            </Form>
        </Dialog>
    );
});
export default QuantityPopup;
