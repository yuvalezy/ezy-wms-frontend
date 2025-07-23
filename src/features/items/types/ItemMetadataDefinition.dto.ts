import { MetadataFieldType } from '../../packages/types/MetadataFieldType.enum';

export interface ItemMetadataDefinition {
  id: string;
  description: string;
  type: MetadataFieldType;
  required: boolean;
  readOnly: boolean;
}