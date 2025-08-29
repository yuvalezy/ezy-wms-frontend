import {ObjectType} from './ObjectType.enum';

export interface CreatePackageRequest {
  binEntry?: number;
  sourceOperationType?: ObjectType;
  sourceOperationId?: string;
  customAttributes: Record<string, any>;
}