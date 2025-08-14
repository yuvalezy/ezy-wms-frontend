import { useCallback, useMemo } from 'react';
import { useAuth } from "@/Components";
import {
  UpdatePackageMetadataRequest,
  PackageDto
} from '../types';
import { updatePackageMetadata } from './usePackages';
import {
  useMetadataBase,
  useCalculatedFields,
  ExtendedMetadataDefinition,
  convertFieldValueForApi
} from '@/features/metadata';
import {MetadataDefinition} from "@/features/items";

export const usePackageMetadata = (packageData?: PackageDto, metadataDefinitions?: MetadataDefinition[]) => {
  const { user } = useAuth();
  const packageDefinitions = metadataDefinitions || user!.packageMetaData || [];
  
  // Convert to ExtendedMetadataDefinition for base hook
  const extendedDefinitions = useMemo<ExtendedMetadataDefinition[]>(
    () => packageDefinitions.map(def => ({
      ...def,
      required: def.required || false,
      readOnly: def.readOnly || false,
      calculated: def.calculated
    })),
    [packageDefinitions]
  );

  // Save handler for package metadata
  const handleSave = useCallback(async (metadata: Record<string, any>) => {
    if (!packageData?.id) {
      throw new Error('Package ID is required for saving metadata');
    }
    const request: UpdatePackageMetadataRequest = { metadata };
    return await updatePackageMetadata(packageData.id, request);
  }, [packageData?.id]);

  // Use base metadata hook
  const baseHook = useMetadataBase({
    definitions: extendedDefinitions,
    initialValues: packageData?.customAttributes || {},
    onSave: handleSave
  });

  // Use calculated fields hook for formula evaluation
  const calculatedFields = useCalculatedFields({
    definitions: extendedDefinitions,
    onFieldsUpdate: (fields) => {
      // Update form state with calculated fields
      baseHook.setFormState(prev => ({
        ...prev,
        fields
      }));
    }
  });

  // Save metadata wrapper to ensure package ID is passed
  const saveMetadata = useCallback(async (packageId: string): Promise<PackageDto> => {
    const metadata: Record<string, any> = {};
    
    baseHook.formState.fields.forEach(field => {
      if (field.value !== null && field.value !== undefined && field.value !== '') {
        // Convert field value to appropriate type for API
        metadata[field.fieldId] = convertFieldValueForApi(field.fieldId, field.value, extendedDefinitions);
      } else {
        metadata[field.fieldId] = null;
      }
    });

    const request: UpdatePackageMetadataRequest = { metadata };
    const updatedPackage = await updatePackageMetadata(packageId, request);
    
    // Update form state to reflect successful save
    baseHook.setFormState(prev => ({
      ...prev,
      hasChanges: false
    }));
    
    return updatedPackage;
  }, [baseHook.formState.fields, baseHook.setFormState, extendedDefinitions]);

  return {
    definitions: packageDefinitions,
    formState: baseHook.formState,
    updateFieldValue: baseHook.updateFieldValue,
    saveMetadata,
    resetForm: baseHook.resetForm,
    getFieldDefinition: (fieldId: string) => packageDefinitions?.find(def => def.id === fieldId),
    getFieldValue: baseHook.getFieldValue,
    getFieldValidation: baseHook.getFieldValidation,
    onFieldFocus: calculatedFields.onFieldFocus,
    onFieldBlur: (fieldId: string) => {
      const updatedFields = calculatedFields.onFieldBlur(fieldId, baseHook.formState.fields);
      if (updatedFields !== baseHook.formState.fields) {
        baseHook.setFormState(prev => ({
          ...prev,
          fields: updatedFields
        }));
      }
    }
  };
};