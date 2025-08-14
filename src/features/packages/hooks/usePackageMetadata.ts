import { useCallback, useMemo } from 'react';
import { useAuth } from "@/Components";
import {
  UpdatePackageMetadataRequest,
  PackageDto
} from '../types';
import { updatePackageMetadata } from './usePackages';
import {
  useMetadataBase,
  BaseMetadataDefinition,
  convertFieldValueForApi
} from '@/features/metadata';
import {MetadataDefinition} from "@/features/items";

// Map MetadataDefinition to BaseMetadataDefinition
function mapToBaseDefinition(def: MetadataDefinition): BaseMetadataDefinition {
  return {
    id: def.id,
    description: def.description,
    type: def.type
  };
}

export const usePackageMetadata = (packageData?: PackageDto) => {
  const { user } = useAuth();
  const packageDefinitions = user!.packageMetaData;
  
  const definitions = useMemo(
    () => packageDefinitions ? packageDefinitions.map(mapToBaseDefinition) : [],
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
    definitions,
    initialValues: packageData?.customAttributes || {},
    onSave: handleSave
  });

  // Save metadata wrapper to ensure package ID is passed
  const saveMetadata = useCallback(async (packageId: string): Promise<PackageDto> => {
    const metadata: Record<string, any> = {};
    
    baseHook.formState.fields.forEach(field => {
      if (field.value !== null && field.value !== undefined && field.value !== '') {
        // Convert field value to appropriate type for API
        metadata[field.fieldId] = convertFieldValueForApi(field.fieldId, field.value, definitions);
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
  }, [baseHook.formState.fields, baseHook.setFormState, definitions]);

  return {
    definitions: packageDefinitions,
    formState: baseHook.formState,
    updateFieldValue: baseHook.updateFieldValue,
    saveMetadata,
    resetForm: baseHook.resetForm,
    getFieldDefinition: (fieldId: string) => packageDefinitions?.find(def => def.id === fieldId),
    getFieldValue: baseHook.getFieldValue,
    getFieldValidation: baseHook.getFieldValidation
  };
};