import { MetadataFieldType } from '@/features/packages/types';

// Common metadata field value interface
export interface MetadataFieldValue {
  fieldId: string;
  value: string | number | Date | null;
  isValid: boolean;
  errorMessage?: string;
}

// Common form state interface
export interface MetadataFormState {
  fields: MetadataFieldValue[];
  isValid: boolean;
  isLoading: boolean;
  hasChanges: boolean;
}

// Base metadata definition interface
export interface BaseMetadataDefinition {
  id: string;
  description: string;
  type: MetadataFieldType;
}

// Extended metadata definition with optional features
export interface ExtendedMetadataDefinition extends BaseMetadataDefinition {
  step?: number;
  required?: boolean;
  readOnly?: boolean;
  calculated?: CalculatedFieldConfig;
}

// Calculated field configuration
export interface CalculatedFieldConfig {
  formula: string;
  dependencies: string[];
  precision: number;
  clearDependenciesOnManualEdit: boolean;
}

// Generic metadata update request
export interface UpdateMetadataRequest {
  metadata: Record<string, any>;
}

// Hook configuration options
export interface MetadataHookOptions<T> {
  definitions: T[];
  currentValues: Record<string, any>;
  onSave?: (metadata: Record<string, any>) => Promise<any>;
  enableCalculatedFields?: boolean;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}