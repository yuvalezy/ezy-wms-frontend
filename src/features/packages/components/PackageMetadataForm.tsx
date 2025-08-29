import React from 'react';
import {useTranslation} from 'react-i18next';
import {BaseMetadataForm} from '@/features/metadata/components';
import {PackageDto} from '../types';
import {usePackageMetadata} from '../hooks';
import {MetadataDefinition} from "@/features/items";

interface PackageMetadataFormProps {
  packageData: PackageDto & { metadataDefinitions?: MetadataDefinition[] };
  onSave?: (updatedPackage: PackageDto) => void;
  onCancel?: () => void;
  className?: string;
}

export const PackageMetadataForm: React.FC<PackageMetadataFormProps> = ({
  packageData,
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
  } = usePackageMetadata(packageData, packageData.metadataDefinitions);

  const handleSave = async () => {
    try {
      const updatedPackage = await saveMetadata(packageData.id);
      onSave?.(updatedPackage);
    } catch (error) {
      console.error('Failed to save metadata:', error);
      // Error is handled by the hook and ThemeContext
    }
  };

  return (
    <BaseMetadataForm
      title={t('packages.metadata')}
      noFieldsMessage={t('packages.noMetadataFieldsConfigured')}
      definitions={definitions}
      currentValues={packageData.customAttributes || {}}
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