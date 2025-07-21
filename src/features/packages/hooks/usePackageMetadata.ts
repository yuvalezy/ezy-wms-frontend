import { useState, useEffect, useCallback } from 'react';
import { useThemeContext } from '@/components/ThemeContext';
import { 
  PackageMetadataDefinition, 
  UpdatePackageMetadataRequest, 
  MetadataFieldType, 
  PackageDto 
} from '../types';
import { 
  getPackageMetadataDefinitions, 
  updatePackageMetadata 
} from './usePackages';

export interface MetadataFieldValue {
  fieldId: string;
  value: string | number | Date | null;
  isValid: boolean;
  errorMessage?: string;
}

export interface MetadataFormState {
  fields: MetadataFieldValue[];
  isValid: boolean;
  isLoading: boolean;
  hasChanges: boolean;
}

export const usePackageMetadata = (packageData?: PackageDto) => {
  const { setLoading, setError } = useThemeContext();
  const [definitions, setDefinitions] = useState<PackageMetadataDefinition[]>([]);
  const [formState, setFormState] = useState<MetadataFormState>({
    fields: [],
    isValid: true,
    isLoading: false,
    hasChanges: false
  });

  // Load metadata definitions on mount
  useEffect(() => {
    const loadDefinitions = async () => {
      try {
        setLoading(true);
        const defs = await getPackageMetadataDefinitions();
        setDefinitions(defs);
        
        // Initialize form state with definitions and current package values
        initializeFormState(defs, packageData?.customAttributes || {});
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadDefinitions();
  }, [setLoading, setError, packageData?.id]);

  const initializeFormState = useCallback((
    defs: PackageMetadataDefinition[], 
    currentValues: Record<string, any>
  ) => {
    const fields = defs.map(def => ({
      fieldId: def.id,
      value: currentValues[def.id] || null,
      isValid: true
    }));

    setFormState({
      fields,
      isValid: true,
      isLoading: false,
      hasChanges: false
    });
  }, []);

  const updateFieldValue = useCallback((fieldId: string, value: string | number | Date | null) => {
    setFormState(prev => {
      const updatedFields = prev.fields.map(field => {
        if (field.fieldId === fieldId) {
          const validation = validateFieldValue(fieldId, value);
          return {
            ...field,
            value,
            isValid: validation.isValid,
            errorMessage: validation.errorMessage
          };
        }
        return field;
      });

      const isValid = updatedFields.every(f => f.isValid);
      const hasChanges = checkForChanges(updatedFields, packageData?.customAttributes || {});

      return {
        ...prev,
        fields: updatedFields,
        isValid,
        hasChanges
      };
    });
  }, [packageData?.customAttributes]);

  const validateFieldValue = useCallback((fieldId: string, value: any) => {
    const definition = definitions.find(def => def.id === fieldId);
    if (!definition) {
      return { isValid: false, errorMessage: 'Field definition not found' };
    }

    // Allow null/empty values - all fields are optional
    if (value === null || value === undefined || value === '') {
      return { isValid: true };
    }

    switch (definition.type) {
      case MetadataFieldType.String:
        return { isValid: typeof value === 'string' };
      
      case MetadataFieldType.Decimal:
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) {
          return { isValid: false, errorMessage: 'Must be a valid number' };
        }
        return { isValid: true };
      
      case MetadataFieldType.Date:
        const dateValue = value instanceof Date ? value : new Date(value);
        if (isNaN(dateValue.getTime())) {
          return { isValid: false, errorMessage: 'Must be a valid date' };
        }
        return { isValid: true };
      
      default:
        return { isValid: false, errorMessage: 'Unknown field type' };
    }
  }, [definitions]);

  const checkForChanges = useCallback((
    fields: MetadataFieldValue[], 
    originalValues: Record<string, any>
  ) => {
    return fields.some(field => {
      const originalValue = originalValues[field.fieldId];
      const currentValue = field.value;
      
      // Handle null/undefined comparison
      if (originalValue === null || originalValue === undefined) {
        return currentValue !== null && currentValue !== undefined && currentValue !== '';
      }
      
      if (currentValue === null || currentValue === undefined || currentValue === '') {
        return true; // Changed to null/empty
      }
      
      return originalValue !== currentValue;
    });
  }, []);

  const saveMetadata = useCallback(async (packageId: string): Promise<PackageDto> => {
    if (!formState.isValid) {
      throw new Error('Form contains invalid data');
    }

    setFormState(prev => ({ ...prev, isLoading: true }));

    try {
      // Convert form fields to metadata object
      const metadata: Record<string, any> = {};
      
      formState.fields.forEach(field => {
        if (field.value !== null && field.value !== undefined && field.value !== '') {
          const definition = definitions.find(def => def.id === field.fieldId);
          if (definition) {
            // Convert values to appropriate types
            switch (definition.type) {
              case MetadataFieldType.Decimal:
                metadata[field.fieldId] = typeof field.value === 'string' 
                  ? parseFloat(field.value) 
                  : field.value;
                break;
              case MetadataFieldType.Date:
                metadata[field.fieldId] = field.value instanceof Date 
                  ? field.value.toISOString() 
                  : new Date(field.value as string).toISOString();
                break;
              default:
                metadata[field.fieldId] = field.value;
            }
          }
        } else {
          // Explicitly set to null to remove the field
          metadata[field.fieldId] = null;
        }
      });

      const request: UpdatePackageMetadataRequest = { metadata };
      const updatedPackage = await updatePackageMetadata(packageId, request);

      // Reset form state to reflect successful save
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        hasChanges: false
      }));

      return updatedPackage;
    } catch (error) {
      setFormState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [formState, definitions]);

  const resetForm = useCallback(() => {
    initializeFormState(definitions, packageData?.customAttributes || {});
  }, [definitions, packageData?.customAttributes, initializeFormState]);

  const getFieldDefinition = useCallback((fieldId: string) => {
    return definitions.find(def => def.id === fieldId);
  }, [definitions]);

  const getFieldValue = useCallback((fieldId: string) => {
    const field = formState.fields.find(f => f.fieldId === fieldId);
    return field?.value || null;
  }, [formState.fields]);

  const getFieldValidation = useCallback((fieldId: string) => {
    const field = formState.fields.find(f => f.fieldId === fieldId);
    return {
      isValid: field?.isValid ?? true,
      errorMessage: field?.errorMessage
    };
  }, [formState.fields]);

  return {
    definitions,
    formState,
    updateFieldValue,
    saveMetadata,
    resetForm,
    getFieldDefinition,
    getFieldValue,
    getFieldValidation
  };
};