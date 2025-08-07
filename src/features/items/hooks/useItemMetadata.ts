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

  // Helper function to evaluate calculated field formulas
  const evaluateFormula = useCallback((formula: string, fieldValues: Record<string, any>): number | null => {
    try {
      // Simple formula evaluator - supports basic arithmetic with field references
      let expression = formula;
      
      // Replace field references in curly braces (e.g., {PurchaseUnitLength}) with actual values
      Object.entries(fieldValues).forEach(([fieldId, value]) => {
        if (value !== null && value !== undefined && !isNaN(Number(value))) {
          // Replace both {FieldName} and plain FieldName patterns
          expression = expression.replace(new RegExp(`\\{${fieldId}\\}`, 'g'), String(value));
          expression = expression.replace(new RegExp(`\\b${fieldId}\\b`, 'g'), String(value));
        }
      });
      
      // Basic validation - only allow numbers, operators, and parentheses
      if (!/^[\d\s+\-*/.()]+$/.test(expression)) {
        return null;
      }
      
      // Evaluate the expression
      const result = Function(`"use strict"; return (${expression})`)();
      
      return typeof result === 'number' && !isNaN(result) ? result : null;
    } catch (error) {
      console.warn('Formula evaluation error:', error);
      return null;
    }
  }, []);

  // Helper function to get all field values as a record
  const getFieldValuesRecord = useCallback((fields: MetadataFieldValue[]): Record<string, any> => {
    const values: Record<string, any> = {};
    fields.forEach(field => {
      values[field.fieldId] = field.value;
    });
    return values;
  }, []);

  const initializeFormState = useCallback((
    defs: ItemMetadataDefinition[], 
    currentValues: Record<string, any>
  ) => {
    let fields = defs.map(def => ({
      fieldId: def.id,
      value: currentValues[def.id] || null,
      isValid: true
    }));

    // Recalculate any calculated fields on initialization using the passed definitions
    let updatedFields = [...fields];
    const calculatedDefinitions = defs.filter(def => def.calculated);
    
    calculatedDefinitions.forEach(definition => {
      if (!definition.calculated) return;
      
      const { formula, dependencies, precision } = definition.calculated;
      const fieldValues = getFieldValuesRecord(updatedFields);
      
      // Check if all dependencies have valid values
      const allDependenciesValid = dependencies.every(depId => {
        const depValue = fieldValues[depId];
        return depValue !== null && depValue !== undefined && !isNaN(Number(depValue));
      });
      
      if (allDependenciesValid) {
        // Calculate new value
        const calculatedValue = evaluateFormula(formula, fieldValues);
        
        if (calculatedValue !== null) {
          // Apply precision rounding
          const roundedValue = Number(calculatedValue.toFixed(precision));
          
          // Update the calculated field
          updatedFields = updatedFields.map(field => {
            if (field.fieldId === definition.id) {
              return {
                ...field,
                value: roundedValue,
                isValid: true,
                errorMessage: undefined
              };
            }
            return field;
          });
        }
      }
    });

    setFormState({
      fields: updatedFields,
      isValid: true,
      isLoading: false,
      hasChanges: false
    });
  }, [evaluateFormula, getFieldValuesRecord]);

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
      
      case MetadataFieldType.Integer:
        const intValue = typeof value === 'string' ? parseInt(value) : value;
        if (isNaN(intValue) || !Number.isInteger(intValue)) {
          return { isValid: false, errorMessage: 'Must be a valid integer' };
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

  // Helper function to recalculate all calculated fields
  const recalculateFields = useCallback((fields: MetadataFieldValue[]): MetadataFieldValue[] => {
    let updatedFields = [...fields];
    let hasChanges = false;
    
    // Find all calculated field definitions
    const calculatedDefinitions = definitions.filter(def => def.calculated);
    
    calculatedDefinitions.forEach(definition => {
      if (!definition.calculated) return;
      
      const { formula, dependencies, precision } = definition.calculated;
      const fieldValues = getFieldValuesRecord(updatedFields);
      
      // Check if all dependencies have valid values
      const allDependenciesValid = dependencies.every(depId => {
        const depValue = fieldValues[depId];
        return depValue !== null && depValue !== undefined && !isNaN(Number(depValue));
      });
      
      if (allDependenciesValid) {
        // Calculate new value
        const calculatedValue = evaluateFormula(formula, fieldValues);
        
        if (calculatedValue !== null) {
          // Apply precision rounding
          const roundedValue = Number(calculatedValue.toFixed(precision));
          
          // Update the calculated field
          updatedFields = updatedFields.map(field => {
            if (field.fieldId === definition.id) {
              const currentValue = field.value;
              if (currentValue !== roundedValue) {
                hasChanges = true;
                return {
                  ...field,
                  value: roundedValue,
                  isValid: true,
                  errorMessage: undefined
                };
              }
            }
            return field;
          });
        }
      } else {
        // Clear calculated field if dependencies are not met
        updatedFields = updatedFields.map(field => {
          if (field.fieldId === definition.id && field.value !== null) {
            hasChanges = true;
            return {
              ...field,
              value: null,
              isValid: true,
              errorMessage: undefined
            };
          }
          return field;
        });
      }
    });
    
    return hasChanges ? updatedFields : fields;
  }, [definitions, evaluateFormula, getFieldValuesRecord]);

  const updateFieldValue = useCallback((fieldId: string, value: string | number | Date | null) => {
    setFormState(prev => {
      // First, update the changed field
      let updatedFields = prev.fields.map(field => {
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

      // Then recalculate any dependent calculated fields
      updatedFields = recalculateFields(updatedFields);

      const isValid = updatedFields.every(f => f.isValid);
      const hasChanges = checkForChanges(updatedFields, itemData?.customAttributes || {});

      return {
        ...prev,
        fields: updatedFields,
        isValid,
        hasChanges
      };
    });
  }, [itemData?.customAttributes, definitions, validateFieldValue, checkForChanges, recalculateFields]);

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
              case MetadataFieldType.Integer:
                metadata[field.fieldId] = typeof field.value === 'string' 
                  ? parseInt(field.value) 
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