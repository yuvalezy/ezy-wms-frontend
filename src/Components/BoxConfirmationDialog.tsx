import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {useTranslation} from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import {Item} from "../assets/Common";

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
                                            <FontAwesomeIcon icon={faArrowRight} className="mr-3 text-blue-500" />
                                            <span className="font-medium">
                                                {`${item.boxNumber} ${t('of')} ${boxes}`}
                                            </span>
                                        </div>
                                    </div>
                                    {i < (props.items.length - 1) && <Separator className="my-2" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter className="p-4 border-t flex justify-end">
                    <Button onClick={() => setIsOpen(false)} variant="secondary">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        {t("close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

export default BoxConfirmationDialog;
