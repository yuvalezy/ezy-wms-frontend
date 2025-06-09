import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ItemDetails } from '@/pages/item-check/item-check';
import ItemDetailsListPopup from '@/pages/item-check/components/item-details-list-popup';

interface ItemDetailsPopupContextType {
  openItemDetails: (details: ItemDetails) => void;
  closeItemDetails: () => void;
}

const ItemDetailsPopupContext = createContext<ItemDetailsPopupContextType | undefined>(undefined);

interface ItemDetailsPopupProviderProps {
  children: ReactNode;
}

export const ItemDetailsPopupProvider: React.FC<ItemDetailsPopupProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<ItemDetails | null>(null);

  const openItemDetails = (itemDetails: ItemDetails) => {
    setDetails(itemDetails);
    setIsOpen(true);
  };

  const closeItemDetails = () => {
    setIsOpen(false);
    setDetails(null);
  };

  return (
    <ItemDetailsPopupContext.Provider value={{ openItemDetails, closeItemDetails }}>
      {children}
      {details && (
        <ItemDetailsListPopup
          isOpen={isOpen}
          onClose={closeItemDetails}
          details={details}
        />
      )}
    </ItemDetailsPopupContext.Provider>
  );
};

export const useItemDetailsPopup = (): ItemDetailsPopupContextType => {
  const context = useContext(ItemDetailsPopupContext);
  if (!context) {
    throw new Error('useItemDetailsPopup must be used within an ItemDetailsPopupProvider');
  }
  return context;
};