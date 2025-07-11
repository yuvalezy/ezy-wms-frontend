import { ObjectType } from './ObjectType.enum';
import {UnitType} from "@/assets";

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