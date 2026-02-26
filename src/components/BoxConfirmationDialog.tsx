import React, {forwardRef, useImperativeHandle} from 'react';
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {ScrollArea, Separator} from "@/components/ui";
import {ArrowRight, X} from 'lucide-react';

import {ItemInfoResponse} from "@/features/items/data/items";

export interface BoxConfirmationDialogRef {
    show: (show: boolean) => void;
}

type BoxConfirmationDialogProps = {
    onSelected: (itemCode: string) => void;
    itemCode: string;
    items?: ItemInfoResponse[];
}

const BoxConfirmationDialog = forwardRef((props: BoxConfirmationDialogProps, ref) => {
    const {t} = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    let boxes = 0;
    props.items?.forEach(item => {
        let boxNumber = item.boxNumber ?? 0;
        if (boxNumber > boxes) {
            boxes = boxNumber;
        }
    });
    useImperativeHandle(ref, () => ({
        show(show: boolean) {
            setIsOpen(show);
        }
    }))

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="text-lg font-bold">
                        {t('item')}: {props.itemCode}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        {t('selectBox')}
                    </p>
                </DialogHeader>
                <div className="p-4">
                    <ScrollArea className="h-48 w-full rounded-md border">
                        <div className="p-4">
                            {props.items && props.items.map((item, i) => (
                                <React.Fragment key={i}>
                                    <div
                                        className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 rounded-md px-2"
                                        onClick={() => {
                                            props.onSelected(item.code);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <ArrowRight className="h-4 w-4 mr-3 text-blue-500" />
                                            <span className="font-medium">
                                                {`${item.boxNumber} ${t('of')} ${boxes}`}
                                            </span>
                                        </div>
                                    </div>
                                    {props.items && i < (props.items.length - 1) && <Separator className="my-2" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter className="p-4 border-t flex justify-end">
                    <Button onClick={() => setIsOpen(false)} variant="secondary">
                        <X className="h-4 w-4 mr-2" />
                        {t("close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

export default BoxConfirmationDialog;
