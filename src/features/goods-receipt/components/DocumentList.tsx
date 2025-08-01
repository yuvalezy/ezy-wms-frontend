import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription, Button, Input, Label} from "@/components";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {AlertCircle, PlusCircle, X} from "lucide-react"; // Icons
import {toast} from "sonner";
import {DocumentItem} from "@/features/goods-receipt/data/goods-receipt";
import {useObjectName} from "@/hooks/useObjectName";
import {ProcessType} from "@/features/shared/data";

export interface DocumentListRef {
  clearItems: () => void;
}

type DocumentListProps = {
  onItemsUpdate: (newItems: DocumentItem[]) => void;
  processType?: ProcessType
};

const DocumentList = forwardRef<DocumentListRef, DocumentListProps>((props, ref) => {
  const {t} = useTranslation();
  const o = useObjectName();
  const docNumInputRef = useRef<HTMLInputElement>(null); // Ref for the input element
  const [items, setItems] = useState<DocumentItem[]>([]);

  // Using string values for select, as objectType is number
  const PURCHASE_DELIVERY_NOTE = "20";
  const PURCHASE_ORDER_TYPE = "22";
  const RESERVED_INVOICE_TYPE = "18";
  const STOCK_TRANSFER_TYPE = "67";
  const [objTypeString, setObjTypeString] = useState<string>(props.processType === ProcessType.Regular ? PURCHASE_ORDER_TYPE :
    props.processType === ProcessType.TransferConfirmation ? STOCK_TRANSFER_TYPE :
      PURCHASE_DELIVERY_NOTE);

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
        <div className="border-b pb-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between border-b last:border-b-0">
              <span>{`${o(item.objectType)}: ${item.documentNumber}`}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemoveClick(index)}
                aria-label={t('delete')}
                className="hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4 text-red-500"/>
              </Button>
            </div>
          ))}
        </div>
      )}
      {items.length === 0 && (
        <Alert variant="information">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>
            {props.processType === ProcessType.TransferConfirmation ? t("noTransfersAdded") : t("noDocumentsAdded")}
          </AlertDescription>
        </Alert>
      )}

      {/* Responsive layout for input fields and button */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-2 space-y-3 sm:space-y-0">
        <div className="flex-grow sm:flex-1"> {/* Document Type */}
          <Label htmlFor="docTypeSelect" className="mb-1 block">{t("documentType")}</Label>
          <Select value={objTypeString} onValueChange={setObjTypeString}>
            <SelectTrigger id="docTypeSelect" className="w-full">
              <SelectValue placeholder={t("selectDocumentType")}/>
            </SelectTrigger>
            <SelectContent>
              {props.processType !== ProcessType.Regular && <SelectItem value={PURCHASE_DELIVERY_NOTE}>{t('goodsReceipt')}</SelectItem>}
              {props.processType === ProcessType.Regular && <SelectItem value={PURCHASE_ORDER_TYPE}>{t('purchaseOrder')}</SelectItem>}
              <SelectItem value={RESERVED_INVOICE_TYPE}>{props.processType === ProcessType.Regular ? t('reservedInvoice') : t('purchaseInvoice')}</SelectItem>
              {props.processType === ProcessType.TransferConfirmation && <SelectItem value={STOCK_TRANSFER_TYPE}>{t('transfer')}</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow sm:flex-1"> {/* Document Number */}
          <Label htmlFor="docNumInput" className="mb-1 block">
            {props.processType === ProcessType.TransferConfirmation ? t("transferNumber") : t("documentNumber")}
          </Label>
          <Input
            id="docNumInput"
            ref={docNumInputRef}
            value={docNum}
            type="number"
            placeholder={props.processType === ProcessType.TransferConfirmation ? t('enterTransferNumber') : t('enterDocumentNumber')}
            onChange={e => setDocNum(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
            className="w-full"
          />
        </div>
        <div className="sm:flex-none pt-3 sm:pt-0"> {/* Add Button */}
          {/* On small screens, label might be redundant if button text is clear, or add margin if label is kept */}
          {/* <Label className="mb-1 block sm:hidden">&nbsp;</Label>  Optional: Spacer for alignment on small screens if labels are above */}
          <Button type="button" onClick={handleAddClick} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4"/> {t('add')}
          </Button>
        </div>
      </div>
    </div>
  );
});

DocumentList.displayName = "DocumentList";
export default DocumentList;
