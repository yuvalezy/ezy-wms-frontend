import { PackageMovementType } from './PackageMovementType.enum';
import { ObjectType } from './ObjectType.enum';

export interface PackageLocationHistoryDto {
  id: string;
  packageId: string;
  movementType: PackageMovementType;
  fromWhsCode?: string;
  fromBinEntry?: number;
  fromBinCode?: string;
  toWhsCode: string;
  toBinEntry?: number;
  toBinCode?: string;
  sourceOperationType: ObjectType;
  sourceOperationId?: string;
  userId: string;
  movementDate: Date;
  notes?: string;
}