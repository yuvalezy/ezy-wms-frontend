import { PackageTransactionType } from './PackageTransactionType.enum';
import { ObjectType } from './ObjectType.enum';
import {UnitType} from "@/assets";

export interface LogPackageTransactionRequest {
  packageId: string;
  transactionType: PackageTransactionType;
  itemCode: string;
  quantity: number;
  unitType: UnitType;
  sourceOperationType?: ObjectType;
  sourceOperationId?: string;
  sourceOperationLineId?: string;
  userId: string;
  notes?: string;
}