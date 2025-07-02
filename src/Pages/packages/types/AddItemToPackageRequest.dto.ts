import { UnitType } from './UnitType.enum';
import { ObjectType } from './ObjectType.enum';

export interface AddItemToPackageRequest {
  packageId: string;
  itemCode: string;
  quantity: number;
  unitType: UnitType;
  binEntry?: number;
  sourceOperationType?: ObjectType;
  sourceOperationId?: string;
  sourceOperationLineId?: string;
}