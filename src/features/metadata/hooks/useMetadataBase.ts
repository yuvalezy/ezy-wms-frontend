import { useState, useCallback, useEffect } from 'react';
import { useThemeContext } from '@/components/ThemeContext';
import {
  MetadataFieldValue,
  MetadataFormState,
  BaseMetadataDefinition,
  ValidationResult
} from '../types';
import {
  validateFieldValue,
  checkForChanges,
  initializeFields,
  fieldsToMetadata
} from '../utils';

export interface UseMetadataBaseOptions<T extends BaseMetadataDefinition> {
  definitions: T[];
  initialValues?: Record<string, any>;
  onSave?: (metadata: Record<string, any>) => Promise<any>;
}

export interface UseMetadataBaseReturn<T extends BaseMetadataDefinition> {
  definitions: T[];
  formState: MetadataFormState;
  updateFieldValue: (fieldId: string, value: string | number | Date | null) => void;
  saveMetadata: (identifier?: string) => Promise<any>;
  resetForm: () => void;
  getFieldDefinition: (fieldId: string) => T | undefined;
  getFieldValue: (fieldId: string) => any;
  getFieldValidation: (fieldId: string) => ValidationResult;
  setFormState: React.Dispatch<React.SetStateAction<MetadataFormState>>;
}

/**
 * Base hook for metadata form management
 * Provides core functionality that can be extended for specific use cases
 */
export function useMetadataBase<T extends BaseMetadataDefinition>(
  options: UseMetadataBaseOptions<T>
): UseMetadataBaseReturn<T> {
  const { definitions, initialValues = {}, onSave } = options;
  const { setError } = useThemeContext();
  
  const [formState, setFormState] = useState<MetadataFormState>({
    fields: [],
    isValid: true,
    isLoading: false,
    hasChanges: false
  });

  // Initialize form state when definitions or initial values change
  const initializeFormState = useCallback(() => {
    const fields = initializeFields(definitions, initialValues);
    setFormState({
      fields,
      isValid: true,
      isLoading: false,
      hasChanges: false
    });
  }, [definitions, initialValues]);

  // Update a single field value
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
      const hasChanges = checkForChanges(updatedFields, initialValues);

      return {
        ...prev,
        fields: updatedFields,
        isValid,
        hasChanges
      };
    });
  }, [definitions, initialValues]);

  // Save metadata (calls the provided onSave function)
  const saveMetadata = useCallback(async (identifier?: string): Promise<any> => {
    if (!formState.isValid) {
      throw new Error('Form contains invalid data');
    }

    if (!onSave) {
      throw new Error('No save handler provided');
    }

    setFormState(prev => ({ ...prev, isLoading: true }));

    try {
      const metadata = fieldsToMetadata(formState.fields, definitions);
      const result = await onSave(metadata);

      // Reset form state to reflect successful save
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        hasChanges: false
      }));

      return result;
    } catch (error) {
      setFormState(prev => ({ ...prev, isLoading: false }));
      setError(error as Error);
      throw error;
    }
  }, [formState, definitions, onSave, setError]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    initializeFormState();
  }, [initializeFormState]);

  // Get field definition by ID
  const getFieldDefinition = useCallback((fieldId: string): T | undefined => {
    return definitions.find(def => def.id === fieldId);
  }, [definitions]);

  // Get field value by ID
  const getFieldValue = useCallback((fieldId: string): any => {
    const field = formState.fields.find(f => f.fieldId === fieldId);
    return field?.value || null;
  }, [formState.fields]);

  // Get field validation status
  const getFieldValidation = useCallback((fieldId: string): ValidationResult => {
    const field = formState.fields.find(f => f.fieldId === fieldId);
    return {
      isValid: field?.isValid ?? true,
      errorMessage: field?.errorMessage
    };
  }, [formState.fields]);

  // Initialize on mount and when dependencies change
  useEffect(() => {
    if (definitions && definitions.length > 0) {
      initializeFormState();
    }
  }, [definitions, initialValues, initializeFormState]);

  return {
    definitions,
    formState,
    updateFieldValue,
    saveMetadata,
    resetForm,
    getFieldDefinition,
    getFieldValue,
    getFieldValidation,
    setFormState
  };
}