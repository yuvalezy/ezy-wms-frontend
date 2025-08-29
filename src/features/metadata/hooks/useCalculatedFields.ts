import {useCallback, useState} from 'react';
import {ExtendedMetadataDefinition, MetadataFieldValue} from '../types';
import {getFieldValuesRecord} from '../utils';

export interface UseCalculatedFieldsOptions {
  definitions: ExtendedMetadataDefinition[];
  onFieldsUpdate?: (fields: MetadataFieldValue[]) => void;
}

export interface UseCalculatedFieldsReturn {
  evaluateFormula: (formula: string, fieldValues: Record<string, any>) => number | null;
  recalculateFields: (fields: MetadataFieldValue[]) => MetadataFieldValue[];
  findDependentFields: (fieldId: string) => string[];
  handleManualEditOfCalculatedField: (
    fieldId: string, 
    fields: MetadataFieldValue[]
  ) => MetadataFieldValue[];
  onFieldFocus: (fieldId: string) => void;
  onFieldBlur: (fieldId: string, fields: MetadataFieldValue[]) => MetadataFieldValue[];
  focusedFieldId: string | null;
}

/**
 * Hook for managing calculated fields with formulas and dependencies
 */
export function useCalculatedFields(
  options: UseCalculatedFieldsOptions
): UseCalculatedFieldsReturn {
  const { definitions, onFieldsUpdate } = options;
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null);

  /**
   * Safe formula evaluator without using eval
   * Supports basic arithmetic: +, -, *, /, and parentheses
   */
  const evaluateFormula = useCallback((formula: string, fieldValues: Record<string, any>): number | null => {
    try {
      let expression = formula;
      
      // Replace field references with actual values
      Object.entries(fieldValues).forEach(([fieldId, value]) => {
        if (value !== null && value !== undefined && !isNaN(Number(value))) {
          expression = expression.replace(new RegExp(`\\{${fieldId}\\}`, 'g'), String(value));
          expression = expression.replace(new RegExp(`\\b${fieldId}\\b`, 'g'), String(value));
        }
      });
      
      // Basic validation - only allow numbers, operators, and parentheses
      if (!/^[\d\s+\-*/.()]+$/.test(expression)) {
        return null;
      }
      
      // Safe calculation without eval
      const safeCalculate = (expr: string): number => {
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
        
        // Tokenize expression
        const tokens: (string | number)[] = [];
        let currentNumber = '';
        
        for (let i = 0; i < expr.length; i++) {
          const char = expr[i];
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
        
        // Process multiplication and division
        for (let i = 1; i < tokens.length - 1; i += 2) {
          if (tokens[i] === '*' || tokens[i] === '/') {
            const left = Number(tokens[i - 1]);
            const right = Number(tokens[i + 1]);
            const result = tokens[i] === '*' ? left * right : left / right;
            tokens.splice(i - 1, 3, result);
            i -= 2;
          }
        }
        
        // Process addition and subtraction
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

  /**
   * Find all fields that depend on a given field (with cycle detection)
   */
  const findDependentFields = useCallback((fieldId: string, visited: Set<string> = new Set()): string[] => {
    if (visited.has(fieldId)) {
      console.warn(`Circular dependency detected involving field: ${fieldId}`);
      return [];
    }
    
    visited.add(fieldId);
    const dependents: string[] = [];
    
    definitions.forEach(def => {
      if (def.calculated && def.calculated.dependencies.includes(fieldId)) {
        dependents.push(def.id);
        // Recursively find transitive dependencies
        const transitiveDependents = findDependentFields(def.id, new Set(Array.from(visited)));
        dependents.push(...transitiveDependents);
      }
    });
    
    return Array.from(new Set(dependents)); // Remove duplicates
  }, [definitions]);

  /**
   * Recalculate all calculated fields based on current values
   */
  const recalculateFields = useCallback((fields: MetadataFieldValue[]): MetadataFieldValue[] => {
    let updatedFields = [...fields];
    let hasChanges = false;
    
    const calculatedDefinitions = definitions.filter(def => def.calculated);
    
    calculatedDefinitions.forEach(definition => {
      if (!definition.calculated) return;
      
      // Skip if field is focused and has clearDependenciesOnManualEdit
      if (focusedFieldId === definition.id && definition.calculated.clearDependenciesOnManualEdit) {
        return;
      }
      
      const { formula, dependencies, precision } = definition.calculated;
      const fieldValues = getFieldValuesRecord(updatedFields);
      
      // Check if all dependencies have valid values
      const allDependenciesValid = dependencies.every(depId => {
        const depValue = fieldValues[depId];
        return depValue !== null && depValue !== undefined && !isNaN(Number(depValue));
      });
      
      if (allDependenciesValid) {
        const calculatedValue = evaluateFormula(formula, fieldValues);
        
        if (calculatedValue !== null) {
          const roundedValue = Number(calculatedValue.toFixed(precision));
          
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
  }, [definitions, evaluateFormula, focusedFieldId]);

  /**
   * Handle manual edit of a calculated field with clearDependenciesOnManualEdit
   */
  const handleManualEditOfCalculatedField = useCallback((
    fieldId: string,
    fields: MetadataFieldValue[]
  ): MetadataFieldValue[] => {
    const editedFieldDef = definitions.find(def => def.id === fieldId);
    
    if (!editedFieldDef?.calculated?.clearDependenciesOnManualEdit) {
      return fields;
    }

    let updatedFields = [...fields];
    const fieldsToClear = editedFieldDef.calculated.dependencies || [];
    
    // Clear the dependency fields
    updatedFields = updatedFields.map(field => {
      if (fieldsToClear.includes(field.fieldId)) {
        return {
          ...field,
          value: null,
          isValid: true,
          errorMessage: undefined
        };
      }
      return field;
    });
    
    // Clear cascaded dependent fields (excluding the edited field)
    const cascadedFieldsToClear: string[] = [];
    fieldsToClear.forEach(clearedFieldId => {
      const dependents = findDependentFields(clearedFieldId);
      const filteredDependents = dependents.filter(depId => depId !== fieldId);
      cascadedFieldsToClear.push(...filteredDependents);
    });
    
    if (cascadedFieldsToClear.length > 0) {
      updatedFields = updatedFields.map(field => {
        if (cascadedFieldsToClear.includes(field.fieldId)) {
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
    
    return updatedFields;
  }, [definitions, findDependentFields]);

  /**
   * Handle field focus event
   */
  const onFieldFocus = useCallback((fieldId: string) => {
    const definition = definitions.find(def => def.id === fieldId);
    if (definition?.calculated?.clearDependenciesOnManualEdit) {
      setFocusedFieldId(fieldId);
    }
  }, [definitions]);

  /**
   * Handle field blur event
   */
  const onFieldBlur = useCallback((fieldId: string, fields: MetadataFieldValue[]): MetadataFieldValue[] => {
    const definition = definitions.find(def => def.id === fieldId);
    
    if (definition?.calculated?.clearDependenciesOnManualEdit && focusedFieldId === fieldId) {
      setFocusedFieldId(null);
      
      // Recalculate if field is empty or invalid
      const field = fields.find(f => f.fieldId === fieldId);
      if (field && (field.value === null || field.value === '' || !field.isValid)) {
        return recalculateFields(fields);
      }
    }
    
    return fields;
  }, [definitions, focusedFieldId, recalculateFields]);

  return {
    evaluateFormula,
    recalculateFields,
    findDependentFields,
    handleManualEditOfCalculatedField,
    onFieldFocus,
    onFieldBlur,
    focusedFieldId
  };
}