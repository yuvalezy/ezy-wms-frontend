import React from 'react';
import {useTranslation} from 'react-i18next';
import {BaseMetadataForm} from '@/features/metadata/components';
import {ItemDetails} from '../data/items';
import {MetadataDefinition, useItemMetadata} from '@/features/items';

interface ItemMetadataFormProps {
  itemData: ItemDetails & { metadataDefinitions?: MetadataDefinition[] };
  onSave?: (updatedItem: ItemDetails) => void;
  onCancel?: () => void;
  className?: string;
}

export const ItemMetadataForm: React.FC<ItemMetadataFormProps> = ({
  itemData,
  onSave,
  onCancel,
  className
}) => {
  const { t } = useTranslation();
  
  const {
    definitions,
    formState: metadataFormState,
    updateFieldValue,
    saveMetadata,
    resetForm,
    getFieldValue,
    getFieldValidation,
    onFieldFocus,
    onFieldBlur
  } = useItemMetadata(itemData, itemData.metadataDefinitions);

  const handleSave = async () => {
    try {
      const updatedItem = await saveMetadata(itemData.itemCode);
      onSave?.(updatedItem);
    } catch (error) {
      console.error('Failed to save metadata:', error);
      // Error is handled by the hook and ThemeContext
    }
  };

  return (
    <BaseMetadataForm
      title={t('metadata')}
      noFieldsMessage={t('items.noMetadataFieldsConfigured')}
      definitions={definitions}
      currentValues={itemData.customAttributes || {}}
      formState={metadataFormState}
      getFieldValue={getFieldValue}
      getFieldValidation={getFieldValidation}
      updateFieldValue={updateFieldValue}
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
      onSave={handleSave}
      onReset={resetForm}
      onCancel={onCancel}
      className={className}
    />
  );
};