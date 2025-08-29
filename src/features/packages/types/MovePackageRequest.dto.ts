import {ObjectType} from './ObjectType.enum';

export interface MovePackageRequest {
  packageId: string;
  toWhsCode: string;
  toBinEntry?: number;
  userId: string;
  sourceOperationType?: ObjectType;
  sourceOperationId?: string;
  notes?: string;
}