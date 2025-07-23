import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import InfoBox from '@/components/InfoBox';
import { ItemDetails } from '../data/items';
import { ItemMetadataDefinition } from '../types/ItemMetadataDefinition.dto';
import { MetadataFieldType } from '../../packages/types/MetadataFieldType.enum';
import { ItemMetadataForm } from './ItemMetadataForm';
import {useAuth} from "@/Components";

interface ItemMetadataDisplayProps {
  itemData: ItemDetails;
  className?: string;
  onItemUpdate?: (updatedItem: ItemDetails) => void;
}

export const ItemMetadataDisplay: React.FC<ItemMetadataDisplayProps> = ({
  itemData,
  className,
  onItemUpdate
}) => {
  const { t } = useTranslation();
  const {user} = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const definitions = user!.itemMetaData;

  const formatValue = (value: any, fieldType: MetadataFieldType): string => {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (fieldType) {
      case MetadataFieldType.Date:
        return new Date(value).toLocaleDateString();
      case MetadataFieldType.Decimal:
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      case MetadataFieldType.String:
      default:
        return String(value);
    }
  };

  const getFieldTypeLabel = (fieldType: MetadataFieldType): string => {
    switch (fieldType) {
      case MetadataFieldType.String:
        return t('text');
      case MetadataFieldType.Decimal:
        return t('number');
      case MetadataFieldType.Date:
        return t('date');
      default:
        return t('unknown');
    }
  };

  const hasMetadata = definitions && definitions.length > 0;
  const hasValues = itemData.customAttributes && Object.keys(itemData.customAttributes).length > 0;

  const handleSave = (updatedItem: ItemDetails) => {
    // Merge the updated item with the existing item data to preserve other properties
    const mergedItem: ItemDetails = {
      ...itemData,
      ...updatedItem,
    };
    onItemUpdate?.(mergedItem);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  if (!hasMetadata) {
    return null;
  }

  const renderEditButton = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Edit className="h-4 w-4" />
          <span className="ml-2">{t('edit')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('items.editMetadata')}</DialogTitle>
        </DialogHeader>
        <ItemMetadataForm
          itemData={itemData}
          onSave={handleSave}
          onCancel={handleCancel}
          className="border-0 shadow-none"
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div>&nbsp;</div>
        {renderEditButton()}
      </div>
      <InfoBox>
        {definitions?.map(definition => {
          const value = itemData.customAttributes?.[definition.id];
          const displayValue = formatValue(value, definition.type);
          
          return (
            <div key={definition.id}>
              <span className="text-gray-500">{definition.description}</span>
              <span className="ml-1 text-xs text-gray-400">{getFieldTypeLabel(definition.type)}</span>
              {definition.required && <span className="text-red-500 ml-1">*</span>}
              {definition.readOnly && <span className="text-gray-400 ml-1">(RO)</span>}
              <span className="text-gray-500">:</span>
              <span className="ml-2 font-medium">{displayValue}</span>
            </div>
          );
        })}
      </InfoBox>
    </div>
  );
};