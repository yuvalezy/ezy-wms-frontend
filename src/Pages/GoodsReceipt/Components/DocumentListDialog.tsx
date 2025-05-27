import React, {forwardRef, useImperativeHandle, useRef} from "react";
import {
    Bar,
    Button,
    Dialog, DialogDomRef, List, StandardListItem,
} from "@ui5/webcomponents-react";
import {useTranslation} from "react-i18next";
import {Document} from '@/Assets/Document'
import {useObjectName} from "@/Assets/ObjectName";

export interface DocumentListDialogRef {
    show: () => void;
}

export interface DocumentListDialogProps {
    doc: Document | null;
}

const DocumentListDialog = forwardRef((props: DocumentListDialogProps, ref) => {
    const {t} = useTranslation();
    const o = useObjectName();
    const dialogRef = useRef<DialogDomRef>(null);

    useImperativeHandle(ref, () => ({
        show() {
            dialogRef?.current?.show();
        }
    }))

    return (
        <Dialog
            className="footerPartNoPadding"
            ref={dialogRef}
            footer={
                <Bar
                    design="Footer"
                    endContent={
                        <Button onClick={() => dialogRef?.current?.close()}>
                            {t("close")}
                        </Button>
                    }
                />
            }
        >
            <List headerText={t("documentsList")}>
                {props.doc?.specificDocuments?.map((value) => <StandardListItem>{o(value.objectType)} #{value.documentNumber}</StandardListItem>)}
            </List>
        </Dialog>
    );
});
export default DocumentListDialog;
