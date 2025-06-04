import ItemDetailsList from './item-details-list';
import React from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose} from "@/components/ui/dialog";
import {X} from "lucide-react";
import {ItemDetails} from "../item";
import {useTranslation} from "react-i18next";

interface ItemDetailsListPopupProps {
  isOpen: boolean;
  onClose: () => void;
  details: ItemDetails;
}

const ItemDetailsListPopup: React.FC<ItemDetailsListPopupProps> = (
  {
    isOpen,
    onClose,
    details,
  }) => {
  const {t} = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('itemDetails')}</DialogTitle>
          <DialogClose
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4"/>
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <ItemDetailsList details={details}/>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsListPopup;

