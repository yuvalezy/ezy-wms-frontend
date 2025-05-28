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
import { StatusAlertType } from '@/components/ThemeProviderStatusAlert'; // Ensure this path is correct

export interface DocumentListRef {
    clearItems: () => void;
}

type DocumentListProps = {
    onItemsUpdate: (newItems: DocumentItem[]) => void;
};

const DocumentList = forwardRef<DocumentListRef, DocumentListProps>((props, ref) => {
    const { t } = useTranslation();
    const { setAlert } = useThemeContext();
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
            setAlert({ message: t('documentRequired'), type: StatusAlertType.Warning });
            return;
        }
        const currentObjectType = parseInt(objTypeString);
        const currentDocumentNumber = parseInt(docNum);

        if (isNaN(currentDocumentNumber)) {
            setAlert({ message: t('invalidDocumentNumber'), type: StatusAlertType.Warning }); // Assuming translation exists
            return;
        }

        let newDocument: DocumentItem = {
            objectType: currentObjectType,
            documentNumber: currentDocumentNumber
        };

        if (items.find(i => i.objectType === newDocument.objectType && i.documentNumber === newDocument.documentNumber)) {
            setAlert({ message: t('duplicateNotAllowed'), type: StatusAlertType.Warning });
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

            <div className="flex items-end space-x-2">
                <div className="flex-grow">
                    <Label htmlFor="docTypeSelect">{t("documentType")}</Label>
                    <Select value={objTypeString} onValueChange={setObjTypeString}>
                        <SelectTrigger id="docTypeSelect">
                            <SelectValue placeholder={t("selectDocumentType")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={PURCHASE_ORDER_TYPE}>{t('purchaseOrder')}</SelectItem>
                            <SelectItem value={RESERVED_INVOICE_TYPE}>{t('reservedInvoice')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-grow">
                    <Label htmlFor="docNumInput">{t("documentNumber")}</Label>
                    <Input
                        id="docNumInput"
                        ref={docNumInputRef}
                        value={docNum}
                        type="number" // Use number type for better mobile experience
                        placeholder={t('enterDocumentNumber')} // More descriptive placeholder
                        onChange={e => setDocNum(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddClick()} // Optional: Add on Enter
                    />
                </div>
                <Button onClick={handleAddClick} className="shrink-0">
                    <PlusCircle className="mr-2 h-4 w-4" /> {t('add')}
                </Button>
            </div>
        </div>
    );
});

DocumentList.displayName = "DocumentList";
export default DocumentList;
