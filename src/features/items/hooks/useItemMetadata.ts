import { useCallback, useMemo } from 'react';
import { 
  MetadataDefinition,
  UpdateItemMetadataRequest 
} from '../types';
import { ItemDetails } from '../data/items';
import { updateItemMetadata } from '@/features/items';
import {
  useMetadataBase,
  useCalculatedFields,
  MetadataFieldValue,
  ExtendedMetadataDefinition,
  validateFieldValue,
  getFieldValuesRecord,
  convertFieldValueForApi
} from '@/features/metadata';

// Map MetadataDefinition to ExtendedMetadataDefinition
function mapToExtendedDefinition(def: MetadataDefinition): ExtendedMetadataDefinition {
  return {
    id: def.id,
    description: def.description,
    type: def.type,
    step: def.step,
    required: def.required,
    readOnly: def.readOnly,
    calculated: def.calculated
  };
}

export const useItemMetadata = (
  itemData?: ItemDetails, 
  metadataDefinitions?: MetadataDefinition[]
) => {
  const definitions = metadataDefinitions || [];
  const extendedDefinitions = useMemo(
    () => definitions.map(mapToExtendedDefinition),
    [definitions]
  );

  // Save handler for item metadata
  const handleSave = useCallback(async (metadata: Record<string, any>) => {
    if (!itemData?.itemCode) {
      throw new Error('Item code is required for saving metadata');
    }
    const request: UpdateItemMetadataRequest = { metadata };
    return await updateItemMetadata(itemData.itemCode, request);
  }, [itemData?.itemCode]);

  // Use base metadata hook
  const baseHook = useMetadataBase({
    definitions: extendedDefinitions,
    initialValues: itemData?.customAttributes || {},
    onSave: handleSave
  });

  // Use calculated fields hook
  const calculatedFields = useCalculatedFields({
    definitions: extendedDefinitions,
    onFieldsUpdate: (fields) => {
      baseHook.setFormState(prev => ({
        ...prev,
        fields
      }));
    }
  });

  // Enhanced update field value with calculated field support
  const updateFieldValue = useCallback((fieldId: string, value: string | number | Date | null) => {
    baseHook.setFormState(prev => {
      // First, update the changed field
      let updatedFields = prev.fields.map(field => {
        if (field.fieldId === fieldId) {
          const validation = validateFieldValue(fieldId, value, extendedDefinitions);
          return {
            ...field,
            value,
            isValid: validation.isValid,
            errorMessage: validation.errorMessage
          };
        }
        return field;
      });

      // Check if this is a manual edit of a calculated field
      const editedFieldDef = extendedDefinitions.find(def => def.id === fieldId);
      const isManualEditOfCalculatedField = editedFieldDef?.calculated?.clearDependenciesOnManualEdit;

      if (isManualEditOfCalculatedField) {
        // Handle manual edit of calculated field
        updatedFields = calculatedFields.handleManualEditOfCalculatedField(fieldId, updatedFields);
      } else {
        // Normal flow: recalculate dependent fields
        updatedFields = calculatedFields.recalculateFields(updatedFields);
      }

      const isValid = updatedFields.every(f => f.isValid);
      const hasChanges = updatedFields.some(field => {
        const originalValue = itemData?.customAttributes?.[field.fieldId];
        return originalValue !== field.value;
      });

      return {
        ...prev,
        fields: updatedFields,
        isValid,
        hasChanges
      };
    });
  }, [baseHook, extendedDefinitions, calculatedFields, itemData?.customAttributes]);

  // Initialize with calculated fields
  const initializeWithCalculations = useCallback(() => {
    baseHook.setFormState(prev => {
      let fields = [...prev.fields];
      
      // Initial calculation of calculated fields
      const fieldValues = getFieldValuesRecord(fields);
      const calculatedDefinitions = extendedDefinitions.filter(def => def.calculated);
      
      calculatedDefinitions.forEach(definition => {
        if (!definition.calculated) return;
        
        const { formula, dependencies, precision } = definition.calculated;
        
        // Check if all dependencies have valid values
        const allDependenciesValid = dependencies.every(depId => {
          const depValue = fieldValues[depId];
          return depValue !== null && depValue !== undefined && !isNaN(Number(depValue));
        });
        
        if (allDependenciesValid) {
          const calculatedValue = calculatedFields.evaluateFormula(formula, fieldValues);
          
          if (calculatedValue !== null) {
            const roundedValue = Number(calculatedValue.toFixed(precision));
            
            fields = fields.map(field => {
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
      
      return {
        ...prev,
        fields
      };
    });
  }, [baseHook, extendedDefinitions, calculatedFields]);

  // Save metadata wrapper to ensure item code is passed
  const saveMetadata = useCallback(async (itemCode: string): Promise<ItemDetails> => {
    const metadata: Record<string, any> = {};
    
    baseHook.formState.fields.forEach(field => {
      if (field.value !== null && field.value !== undefined && field.value !== '') {
        // Convert field value to appropriate type for API
        metadata[field.fieldId] = convertFieldValueForApi(field.fieldId, field.value, extendedDefinitions);
      } else {
        metadata[field.fieldId] = null;
      }
    });

    const request: UpdateItemMetadataRequest = { metadata };
    const updatedItem = await updateItemMetadata(itemCode, request);
    
    // Update form state to reflect successful save
    baseHook.setFormState(prev => ({
      ...prev,
      hasChanges: false
    }));
    
    return updatedItem;
  }, [baseHook.formState.fields, baseHook.setFormState, extendedDefinitions]);

  // Handle field focus
  const onFieldFocus = useCallback((fieldId: string) => {
    calculatedFields.onFieldFocus(fieldId);
  }, [calculatedFields]);

  // Handle field blur
  const onFieldBlur = useCallback((fieldId: string) => {
    const updatedFields = calculatedFields.onFieldBlur(fieldId, baseHook.formState.fields);
    if (updatedFields !== baseHook.formState.fields) {
      baseHook.setFormState(prev => ({
        ...prev,
        fields: updatedFields
      }));
    }
  }, [calculatedFields, baseHook.formState.fields, baseHook.setFormState]);

  // Use the initialization with calculations when data changes
  useMemo(() => {
    if (extendedDefinitions.length > 0 && baseHook.formState.fields.length > 0) {
      initializeWithCalculations();
    }
  }, [itemData?.customAttributes]);

  return {
    definitions,
    formState: baseHook.formState,
    updateFieldValue,
    saveMetadata,
    resetForm: baseHook.resetForm,
    getFieldDefinition: (fieldId: string) => definitions.find(def => def.id === fieldId),
    getFieldValue: baseHook.getFieldValue,
    getFieldValidation: baseHook.getFieldValidation,
    onFieldFocus,
    onFieldBlur
  };
};