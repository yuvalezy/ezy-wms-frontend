import { MetadataFieldType } from './MetadataFieldType.enum';

export interface PackageMetadataDefinition {
  id: string;
  description: string;
  type: MetadataFieldType;
}