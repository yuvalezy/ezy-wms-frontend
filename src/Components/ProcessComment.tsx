import React, {useState, forwardRef, useImperativeHandle, useRef} from "react";
import {
    Bar,
    Button,
    Dialog, DialogDomRef,
    Title,
    TextArea
} from "@ui5/webcomponents-react";
import {ProcessAlertValue} from "./ProcessAlert";
import {useThemeContext} from "./ThemeContext";
import {useTranslation} from "react-i18next";
import {UpdateLineParameters, UpdateLineReturnValue} from "../Assets/Common";

export interface ProcessCommentRef {
    show: (show: boolean) => void;
}

export interface ProcessCommentProps {
    id: number;
    alert?: ProcessAlertValue | null;
    onAccept: (comment: string) => void;
    updateLine: (parameters: UpdateLineParameters) => Promise<UpdateLineReturnValue>;
    updateComplete?: () => void;
}

const ProcessComment = forwardRef((props: ProcessCommentProps, ref) => {
    const {t} = useTranslation();
    const {setError} =  useThemeContext();
    const dialogRef = useRef<DialogDomRef>(null);
    const {setLoading} = useThemeContext();
    const [comment, setComment] = useState(props.alert?.comment || "");

    const handleSave = () => {
        setLoading(true);
        props.updateLine({
            id: props.id,
            lineID: props.alert?.lineID ?? -1,
            comment: comment,
        })
            .then((_) => {
                props.onAccept(comment);
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
    };

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
                        <Button design="Negative" onClick={() => dialogRef?.current?.close()}>
                            {t("cancel")}
                        </Button>
                    }
                    endContent={
                        <Button onClick={() => handleSave()}>
                            {t("accept")}
                        </Button>
                    }
                />
            }
        >
            <Title level="H5">
                {t("comment")}
            </Title>
            <Title level="H6">
                <strong>{t("barcode")}: </strong>
                {props.alert?.barcode}
            </Title>
            <TextArea
                style={{minHeight: "100px", width: "100%"}}
                rows={10}
                value={comment}
                onInput={(e) => setComment(e.target.value as string)}
            />
        </Dialog>
    );
});
export default ProcessComment;
