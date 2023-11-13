import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {useTranslation} from "react-i18next";
import {Button, Bar, Dialog, DialogDomRef, Link, List, StandardListItem, Title, Avatar} from "@ui5/webcomponents-react";
import {Item} from "../Assets/Common";

export interface BoxConfirmationDialogRef {
    show: (show: boolean) => void;
}

type BoxConfirmationDialogProps = {
    onSelected: (itemCode: string) => void;
    itemCode: string;
    items?: Item[];
}

const BoxConfirmationDialog = forwardRef((props: BoxConfirmationDialogProps, ref) => {
    const {t} = useTranslation();
    const dialogRef = useRef<DialogDomRef>(null);

    let boxes = 0;
    props.items?.forEach(item => {
        let boxNumber = item.boxNumber ?? 0;
        if (boxNumber > boxes) {
            boxes = boxNumber;
        }
    });
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
                    endContent={
                        <Button onClick={() => dialogRef?.current?.close()}>
                            {t("close")}
                        </Button>
                    }
                />
            }
        >
            <Title level="H5">
                {t('item')}: {props.itemCode}
            </Title>
            <Title level="H6">
                {t('selectBox')}
            </Title>
            <List>
                {props.items?.map((item, i) => (
                    <StandardListItem key={i}>
                        <Link onClick={() => props.onSelected(item.code)}>
                            <Avatar
                                colorScheme="Accent6"
                                icon="slim-arrow-right"
                                shape="Circle"
                                size="XS"
                            />
                            {`${item.boxNumber} ${t('of')} ${boxes}`}
                        </Link>
                    </StandardListItem>
                ))}
            </List>
        </Dialog>
    );
});

export default BoxConfirmationDialog;