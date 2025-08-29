import {ObjectType} from './ObjectType.enum';

export interface RemoveItemFromPackageRequest {
  packageId: string;
  itemCode: string;
  quantity: number;
  sourceOperationType?: ObjectType;
  sourceOperationId?: string;
}