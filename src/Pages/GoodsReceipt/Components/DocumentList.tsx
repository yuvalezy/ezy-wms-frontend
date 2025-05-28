import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // For better accessibility with inputs
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"; // If list can be long
import { X, PlusCircle } from "lucide-react"; // Icons

import { useThemeContext } from "@/components/ThemeContext";
import { DocumentItem } from "@/Assets/Document";
import { useObjectName } from "@/Assets/ObjectName";
import { toast } from "sonner";

export interface DocumentListRef {
    clearItems: () => void;
}

type DocumentListProps = {
    onItemsUpdate: (newItems: DocumentItem[]) => void;
};

const DocumentList = forwardRef<DocumentListRef, DocumentListProps>((props, ref) => {
    const { t } = useTranslation();
    const o = useObjectName();
    const docNumInputRef = useRef<HTMLInputElement>(null); // Ref for the input element
    const [items, setItems] = useState<DocumentItem[]>([]);
    
    // Using string values for select, as objectType is number
    const PURCHASE_ORDER_TYPE = "22";
    const RESERVED_INVOICE_TYPE = "18";
    const [objTypeString, setObjTypeString] = useState<string>(PURCHASE_ORDER_TYPE);
    
    const [docNum, setDocNum] = useState<string>('');

    useImperativeHandle(ref, () => ({
        clearItems() {
            setItems([]);
            props.onItemsUpdate([]); // Also notify parent
        }
    }));

    const handleAddClick = () => {
        if (docNum.trim().length === 0) {
            toast.warning(t('documentRequired'));
            return;
        }
        const currentObjectType = parseInt(objTypeString);
        const currentDocumentNumber = parseInt(docNum);

        if (isNaN(currentDocumentNumber)) {
            toast.warning(t('invalidDocumentNumber')); // Assuming translation exists
            return;
        }

        let newDocument: DocumentItem = {
            objectType: currentObjectType,
            documentNumber: currentDocumentNumber
        };

        if (items.find(i => i.objectType === newDocument.objectType && i.documentNumber === newDocument.documentNumber)) {
            toast.warning(t('duplicateNotAllowed'));
            return;
        }
        const newItems = [...items, newDocument];
        setItems(newItems);
        setDocNum('');
        docNumInputRef.current?.focus();
        props.onItemsUpdate(newItems);
    };

    const handleRemoveClick = (indexToRemove: number) => {
        const newItems = items.filter((_, index) => index !== indexToRemove);
        setItems(newItems);
        props.onItemsUpdate(newItems);
    };

    return (
        <div className="border rounded-md p-3 space-y-3">
            {items.length > 0 && (
                <ScrollArea className="h-[150px] w-full p-2 border rounded-md"> {/* Adjust height as needed */}
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                                <span>{`${o(item.objectType)}: ${item.documentNumber}`}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveClick(index)} aria-label={t('remove')}>
                                    <X className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            )}
             {items.length === 0 && (
                <p className="text-sm text-muted-foreground p-2 text-center">{t("noDocumentsAdded")}</p>
            )}

            {/* Responsive layout for input fields and button */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-2 space-y-3 sm:space-y-0">
                <div className="flex-grow sm:flex-1"> {/* Document Type */}
                    <Label htmlFor="docTypeSelect" className="mb-1 block">{t("documentType")}</Label>
                    <Select value={objTypeString} onValueChange={setObjTypeString}>
                        <SelectTrigger id="docTypeSelect" className="w-full">
                            <SelectValue placeholder={t("selectDocumentType")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={PURCHASE_ORDER_TYPE}>{t('purchaseOrder')}</SelectItem>
                            <SelectItem value={RESERVED_INVOICE_TYPE}>{t('reservedInvoice')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-grow sm:flex-1"> {/* Document Number */}
                    <Label htmlFor="docNumInput" className="mb-1 block">{t("documentNumber")}</Label>
                    <Input
                        id="docNumInput"
                        ref={docNumInputRef}
                        value={docNum}
                        type="number"
                        placeholder={t('enterDocumentNumber')}
                        onChange={e => setDocNum(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                        className="w-full"
                    />
                </div>
                <div className="sm:flex-none pt-3 sm:pt-0"> {/* Add Button */}
                     {/* On small screens, label might be redundant if button text is clear, or add margin if label is kept */}
                     {/* <Label className="mb-1 block sm:hidden">&nbsp;</Label>  Optional: Spacer for alignment on small screens if labels are above */}
                    <Button onClick={handleAddClick} className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" /> {t('add')}
                    </Button>
                </div>
            </div>
        </div>
    );
});

DocumentList.displayName = "DocumentList";
export default DocumentList;
