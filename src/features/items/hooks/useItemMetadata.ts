import { useState, useEffect, useCallback } from 'react';
import { useThemeContext } from '@/components/ThemeContext';
import { 
  ItemMetadataDefinition, 
  UpdateItemMetadataRequest 
} from '../types';
import { 
  MetadataFieldType 
} from '@/features/packages/types';
import { ItemDetails } from '../data/items';
import { updateItemMetadata } from '@/features/items';

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
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null);

  // Helper function to evaluate calculated field formulas without using eval
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
      
      // Safe evaluation without using eval or Function constructor
      // This implementation handles basic arithmetic: +, -, *, /, and parentheses
      const safeCalculate = (expr: string): number => {
        // Remove all whitespace
        expr = expr.replace(/\s/g, '');
        
        // Helper function to find matching closing parenthesis
        const findClosingParen = (str: string, start: number): number => {
          let count = 1;
          for (let i = start + 1; i < str.length; i++) {
            if (str[i] === '(') count++;
            if (str[i] === ')') count--;
            if (count === 0) return i;
          }
          return -1;
        };
        
        // Process parentheses recursively
        let parenIndex = expr.indexOf('(');
        while (parenIndex !== -1) {
          const closeIndex = findClosingParen(expr, parenIndex);
          if (closeIndex === -1) throw new Error('Mismatched parentheses');
          
          const innerExpr = expr.substring(parenIndex + 1, closeIndex);
          const innerResult = safeCalculate(innerExpr);
          expr = expr.substring(0, parenIndex) + innerResult + expr.substring(closeIndex + 1);
          parenIndex = expr.indexOf('(');
        }
        
        // Split by operators while keeping them
        const tokens: (string | number)[] = [];
        let currentNumber = '';
        
        for (let i = 0; i < expr.length; i++) {
          const char = expr[i];
          // Handle negative numbers at the start or after an operator
          const isNegative = char === '-' && (i === 0 || '+-*/('.includes(expr[i-1]));
          
          if ('+-*/'.includes(char) && !isNegative && i > 0) {
            if (currentNumber) {
              tokens.push(parseFloat(currentNumber));
              currentNumber = '';
            }
            tokens.push(char);
          } else {
            currentNumber += char;
          }
        }
        if (currentNumber) {
          tokens.push(parseFloat(currentNumber));
        }
        
        // Process multiplication and division first (left to right)
        for (let i = 1; i < tokens.length - 1; i += 2) {
          if (tokens[i] === '*' || tokens[i] === '/') {
            const left = Number(tokens[i - 1]);
            const right = Number(tokens[i + 1]);
            const result = tokens[i] === '*' ? left * right : left / right;
            tokens.splice(i - 1, 3, result);
            i -= 2;
          }
        }
        
        // Process addition and subtraction (left to right)
        for (let i = 1; i < tokens.length - 1; i += 2) {
          if (tokens[i] === '+' || tokens[i] === '-') {
            const left = Number(tokens[i - 1]);
            const right = Number(tokens[i + 1]);
            const result = tokens[i] === '+' ? left + right : left - right;
            tokens.splice(i - 1, 3, result);
            i -= 2;
          }
        }
        
        return Number(tokens[0]);
      };
      
      const result = safeCalculate(expression);
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
    console.log('🔢 Recalculating fields. Calculated definitions:', calculatedDefinitions.map(d => d.id));
    
    calculatedDefinitions.forEach(definition => {
      if (!definition.calculated) return;
      
      // Skip recalculation if this field is currently focused and has clearDependenciesOnManualEdit
      if (focusedFieldId === definition.id && definition.calculated.clearDependenciesOnManualEdit) {
        console.log(`⏭️ Skipping recalculation for focused field: ${definition.id}`);
        return;
      }
      
      const { formula, dependencies, precision } = definition.calculated;
      const fieldValues = getFieldValuesRecord(updatedFields);
      
      console.log(`📐 Calculating ${definition.id}:`, {
        formula,
        dependencies,
        fieldValues: Object.fromEntries(dependencies.map(d => [d, fieldValues[d]]))
      });
      
      // Check if all dependencies have valid values
      const allDependenciesValid = dependencies.every(depId => {
        const depValue = fieldValues[depId];
        const isValid = depValue !== null && depValue !== undefined && !isNaN(Number(depValue));
        if (!isValid) {
          console.log(`  ❌ Dependency ${depId} is invalid:`, depValue);
        }
        return isValid;
      });
      
      if (allDependenciesValid) {
        // Calculate new value
        const calculatedValue = evaluateFormula(formula, fieldValues);
        console.log(`  ✅ Calculated value for ${definition.id}:`, calculatedValue);
        
        if (calculatedValue !== null) {
          // Apply precision rounding
          const roundedValue = Number(calculatedValue.toFixed(precision));
          
          // Update the calculated field
          updatedFields = updatedFields.map(field => {
            if (field.fieldId === definition.id) {
              const currentValue = field.value;
              if (currentValue !== roundedValue) {
                console.log(`  📝 Updating ${definition.id}: ${currentValue} -> ${roundedValue}`);
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
        console.log(`  ⚠️ Not all dependencies valid for ${definition.id}`);  
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
  }, [definitions, evaluateFormula, getFieldValuesRecord, focusedFieldId]);

  // Helper function to find all fields that depend on a given field (with cycle detection)
  const findDependentFields = useCallback((fieldId: string, visited: Set<string> = new Set()): string[] => {
    // Prevent infinite loops by tracking visited fields
    if (visited.has(fieldId)) {
      console.warn(`Circular dependency detected involving field: ${fieldId}`);
      return [];
    }
    
    visited.add(fieldId);
    const dependents: string[] = [];
    
    definitions.forEach(def => {
      if (def.calculated && def.calculated.dependencies.includes(fieldId)) {
        dependents.push(def.id);
        // Recursively find fields that depend on this dependent field
        const transitiveDependents = findDependentFields(def.id, new Set(Array.from(visited)));
        dependents.push(...transitiveDependents);
      }
    });
    
    return Array.from(new Set(dependents)); // Remove duplicates
  }, [definitions]);

  const updateFieldValue = useCallback((fieldId: string, value: string | number | Date | null) => {
    console.log('🔄 updateFieldValue called:', { fieldId, value, focusedFieldId });
    
    setFormState(prev => {
      // First, update the changed field
      let updatedFields = prev.fields.map(field => {
        if (field.fieldId === fieldId) {
          const validation = validateFieldValue(fieldId, value, definitions);
          console.log('✏️ Updating field:', { fieldId, value, validation });
          return {
            ...field,
            value,
            isValid: validation.isValid,
            errorMessage: validation.errorMessage
          };
        }
        return field;
      });

      // Check if the EDITED field itself is a calculated field with clearDependenciesOnManualEdit
      const editedFieldDef = definitions.find(def => def.id === fieldId);
      const isManualEditOfCalculatedField = editedFieldDef?.calculated?.clearDependenciesOnManualEdit;
      
      console.log('🔍 Checking edited field:', { 
        fieldId, 
        isCalculated: !!editedFieldDef?.calculated, 
        clearDependenciesOnManualEdit: editedFieldDef?.calculated?.clearDependenciesOnManualEdit 
      });

      if (isManualEditOfCalculatedField) {
        // This is a manual edit of a calculated field with clearDependenciesOnManualEdit
        // Clear the fields that THIS calculated field depends on (its dependencies)
        const fieldsToClear = editedFieldDef.calculated?.dependencies || [];
        
        console.log('🗑️ Manual edit of calculated field - clearing its dependencies:', fieldsToClear);
        
        // Clear the dependency fields
        updatedFields = updatedFields.map(field => {
          if (fieldsToClear.includes(field.fieldId)) {
            console.log(`  - Clearing dependency field: ${field.fieldId}`);
            return {
              ...field,
              value: null,
              isValid: true,
              errorMessage: undefined
            };
          }
          return field;
        });
        
        // Also clear any fields that depend on the cleared fields (cascade)
        // BUT exclude the originally edited field to preserve the manual value
        const cascadedFieldsToClear: string[] = [];
        fieldsToClear.forEach(clearedFieldId => {
          const dependents = findDependentFields(clearedFieldId);
          // Filter out the originally edited field from cascade
          const filteredDependents = dependents.filter(depId => depId !== fieldId);
          cascadedFieldsToClear.push(...filteredDependents);
        });
        
        if (cascadedFieldsToClear.length > 0) {
          console.log('  🌊 Cascading clear to (excluding edited field):', cascadedFieldsToClear);
          updatedFields = updatedFields.map(field => {
            if (cascadedFieldsToClear.includes(field.fieldId)) {
              console.log(`    - Clearing cascaded field: ${field.fieldId}`);
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
      } else {
        console.log('📊 Recalculating fields (normal flow)');
        // Normal flow: recalculate any dependent calculated fields
        updatedFields = recalculateFields(updatedFields);
      }

      const isValid = updatedFields.every(f => f.isValid);
      const hasChanges = checkForChanges(updatedFields, itemData?.customAttributes || {});

      return {
        ...prev,
        fields: updatedFields,
        isValid,
        hasChanges
      };
    });
  }, [itemData?.customAttributes, definitions, validateFieldValue, checkForChanges, recalculateFields, findDependentFields]);

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

  const setFieldFocus = useCallback((fieldId: string | null) => {
    setFocusedFieldId(fieldId);
  }, []);

  const onFieldFocus = useCallback((fieldId: string) => {
    const definition = definitions.find(def => def.id === fieldId);
    console.log(`🎯 Field focused: ${fieldId}`, {
      isCalculated: !!definition?.calculated,
      clearDependenciesOnManualEdit: definition?.calculated?.clearDependenciesOnManualEdit
    });
    // Only set focus state for calculated fields with clearDependenciesOnManualEdit
    if (definition?.calculated?.clearDependenciesOnManualEdit) {
      console.log(`  ✅ Setting focus for editable calculated field: ${fieldId}`);
      setFieldFocus(fieldId);
    }
  }, [definitions, setFieldFocus]);

  const onFieldBlur = useCallback((fieldId: string) => {
    const definition = definitions.find(def => def.id === fieldId);
    console.log(`👋 Field blur: ${fieldId}`, {
      isCalculated: !!definition?.calculated,
      clearDependenciesOnManualEdit: definition?.calculated?.clearDependenciesOnManualEdit,
      wasFocused: focusedFieldId === fieldId
    });
    // Clear focus state and recalculate if needed
    if (definition?.calculated?.clearDependenciesOnManualEdit && focusedFieldId === fieldId) {
      console.log(`  🔄 Clearing focus for: ${fieldId}`);
      setFieldFocus(null);
      
      // After clearing focus, recalculate fields if the manual value should be overridden
      // Only recalculate if the field is empty or invalid
      const field = formState.fields.find(f => f.fieldId === fieldId);
      console.log(`  Field state:`, { value: field?.value, isValid: field?.isValid });
      if (field && (field.value === null || field.value === '' || !field.isValid)) {
        console.log(`  🔢 Triggering recalculation after blur`);
        setFormState(prev => ({
          ...prev,
          fields: recalculateFields(prev.fields)
        }));
      }
    }
  }, [definitions, focusedFieldId, setFieldFocus, formState.fields, recalculateFields]);

  return {
    definitions,
    formState,
    updateFieldValue,
    saveMetadata,
    resetForm,
    getFieldDefinition,
    getFieldValue,
    getFieldValidation,
    onFieldFocus,
    onFieldBlur
  };
};