import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose, // For a simple close button
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { Document } from '@/assets/Document'; // Assuming this type is correct
import { useObjectName } from "@/assets/ObjectName";

export interface DocumentListDialogRef {
    show: () => void;
    hide: () => void;
}

export interface DocumentListDialogProps {
    doc: Document | null;
    // title?: string; // Optional: if the title needs to be more dynamic than "documentsList"
}

const DocumentListDialog = forwardRef<DocumentListDialogRef, DocumentListDialogProps>((props, ref) => {
    const { t } = useTranslation();
    const o = useObjectName();
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        show() {
            setIsOpen(true);
        },
        hide() {
            setIsOpen(false);
        }
    }));

    if (!props.doc) {
        // Or handle this case differently, e.g., show a message in the dialog
        // For now, if no doc, dialog won't open or show anything meaningful
        // return null; 
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]"> {/* Adjust width as needed */}
                <DialogHeader>
                    <DialogTitle>{t("documentsList")}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full rounded-md border p-4"> {/* Example height, adjust as needed */}
                    {props.doc?.documents && props.doc.documents.length > 0 ? (
                        <div className="space-y-2">
                            {props.doc.documents.map((value, index) => (
                                <div key={index} className="p-2 border-b last:border-b-0">
                                    {o(value.objType)} #{value.docNumber}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t("noDocumentsFound")}</p> // Handle empty case
                    )}
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            {t("close")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

DocumentListDialog.displayName = "DocumentListDialog";
export default DocumentListDialog;
