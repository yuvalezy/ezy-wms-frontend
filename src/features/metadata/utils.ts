import { MetadataFieldType } from '@/features/packages/types';
import { 
  MetadataFieldValue, 
  ValidationResult, 
  BaseMetadataDefinition,
  ExtendedMetadataDefinition 
} from './types';

/**
 * Validates a field value against its definition
 */
export function validateFieldValue<T extends BaseMetadataDefinition>(
  fieldId: string,
  value: any,
  definitions: T[]
): ValidationResult {
  const definition = definitions.find(def => def.id === fieldId);
  if (!definition) {
    return { isValid: false, errorMessage: 'Field definition not found' };
  }

  // Check if field is required (for ExtendedMetadataDefinition)
  const isRequired = (definition as ExtendedMetadataDefinition).required;
  
  // Allow null/empty values unless field is required
  if (value === null || value === undefined || value === '') {
    if (isRequired) {
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
}

/**
 * Converts a field value to the appropriate type for API submission
 */
export function convertFieldValueForApi<T extends BaseMetadataDefinition>(
  fieldId: string,
  value: any,
  definitions: T[]
): any {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const definition = definitions.find(def => def.id === fieldId);
  if (!definition) {
    return value;
  }

  switch (definition.type) {
    case MetadataFieldType.Decimal:
      return typeof value === 'string' ? parseFloat(value) : value;
    
    case MetadataFieldType.Integer:
      return typeof value === 'string' ? parseInt(value) : value;
    
    case MetadataFieldType.Date:
      return value instanceof Date 
        ? value.toISOString() 
        : new Date(value as string).toISOString();
    
    default:
      return value;
  }
}

/**
 * Checks if form fields have changes compared to original values
 */
export function checkForChanges(
  fields: MetadataFieldValue[],
  originalValues: Record<string, any>
): boolean {
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
}

/**
 * Initializes form fields from definitions and current values
 */
export function initializeFields<T extends BaseMetadataDefinition>(
  definitions: T[],
  currentValues: Record<string, any>
): MetadataFieldValue[] {
  return definitions.map(def => ({
    fieldId: def.id,
    value: currentValues[def.id] || null,
    isValid: true
  }));
}

/**
 * Converts form fields to metadata object for API submission
 */
export function fieldsToMetadata<T extends BaseMetadataDefinition>(
  fields: MetadataFieldValue[],
  definitions: T[]
): Record<string, any> {
  const metadata: Record<string, any> = {};
  
  fields.forEach(field => {
    if (field.value !== null && field.value !== undefined && field.value !== '') {
      metadata[field.fieldId] = convertFieldValueForApi(field.fieldId, field.value, definitions);
    } else {
      // Explicitly set to null to remove the field
      metadata[field.fieldId] = null;
    }
  });
  
  return metadata;
}

/**
 * Gets all field values as a record (for calculated field evaluation)
 */
export function getFieldValuesRecord(fields: MetadataFieldValue[]): Record<string, any> {
  const values: Record<string, any> = {};
  fields.forEach(field => {
    values[field.fieldId] = field.value;
  });
  return values;
}