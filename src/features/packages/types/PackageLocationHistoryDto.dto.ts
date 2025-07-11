import {PackageMovementType} from './PackageMovementType.enum';
import {ObjectType} from './ObjectType.enum';

import {UserAuditResponse} from "@/features/packages/types/UserAuditResponse.dto";

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
  user?: UserAuditResponse;
  movementDate: Date;
  notes?: string;
}