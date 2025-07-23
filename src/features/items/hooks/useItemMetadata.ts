import { useState, useEffect, useCallback } from 'react';
import { useThemeContext } from '@/components/ThemeContext';
import { 
  ItemMetadataDefinition, 
  UpdateItemMetadataRequest 
} from '../types';
import { 
  MetadataFieldType 
} from '../../packages/types/MetadataFieldType.enum';
import { ItemDetails } from '../data/items';
import { updateItemMetadata } from '../data/items-service';

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

export const useItemMetadata = (itemData?: ItemDetails, metadataDefinitions?: ItemMetadataDefinition[]) => {
  const { setError } = useThemeContext();
  const definitions = metadataDefinitions || [];
  const [formState, setFormState] = useState<MetadataFormState>({
    fields: [],
    isValid: true,
    isLoading: false,
    hasChanges: false
  });

  const initializeFormState = useCallback((
    defs: ItemMetadataDefinition[], 
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

  const validateFieldValue = useCallback((fieldId: string, value: any, defs: ItemMetadataDefinition[]) => {
    const definition = defs.find(def => def.id === fieldId);
    if (!definition) {
      return { isValid: false, errorMessage: 'Field definition not found' };
    }

    // Allow null/empty values unless field is required
    if (value === null || value === undefined || value === '') {
      if (definition.required) {
        return { isValid: false, errorMessage: 'This field is required' };
      }
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
  }, []);

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

  const updateFieldValue = useCallback((fieldId: string, value: string | number | Date | null) => {
    setFormState(prev => {
      const updatedFields = prev.fields.map(field => {
        if (field.fieldId === fieldId) {
          const validation = validateFieldValue(fieldId, value, definitions);
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
      const hasChanges = checkForChanges(updatedFields, itemData?.customAttributes || {});

      return {
        ...prev,
        fields: updatedFields,
        isValid,
        hasChanges
      };
    });
  }, [itemData?.customAttributes, definitions, validateFieldValue, checkForChanges]);

  // Initialize form state when definitions or item data changes
  useEffect(() => {
    if (definitions && definitions.length > 0) {
      // Initialize form state with definitions and current item values
      initializeFormState(definitions, itemData?.customAttributes || {});
    }
  }, [definitions, itemData?.customAttributes, initializeFormState]);

  const saveMetadata = useCallback(async (itemCode: string): Promise<ItemDetails> => {
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

      const request: UpdateItemMetadataRequest = { metadata };
      const updatedItem = await updateItemMetadata(itemCode, request);

      // Reset form state to reflect successful save
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        hasChanges: false
      }));

      return updatedItem;
    } catch (error) {
      setFormState(prev => ({ ...prev, isLoading: false }));
      setError(error as Error);
      throw error;
    }
  }, [formState, definitions, setError]);

  const resetForm = useCallback(() => {
    initializeFormState(definitions, itemData?.customAttributes || {});
  }, [definitions, itemData?.customAttributes, initializeFormState]);

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