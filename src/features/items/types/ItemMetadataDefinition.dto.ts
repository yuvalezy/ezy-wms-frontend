import {MetadataFieldType} from '@/features/packages/types';

export interface ItemMetadataDefinition {
  id: string;
  description: string;
  type: MetadataFieldType;
  required: boolean;
  readOnly: boolean;
  calculated?: Calculated;
}

export interface Calculated {
  formula: string;
  dependencies: string[];
  precision: number;
}