import {MetadataFieldType} from '@/features/packages/types';

export interface MetadataDefinition {
  id: string;
  description: string;
  type: MetadataFieldType;
  step?: number;
  required: boolean;
  readOnly: boolean;
  calculated?: Calculated;
}

export interface Calculated {
  formula: string;
  dependencies: string[];
  precision: number;
  clearDependenciesOnManualEdit: boolean;
}