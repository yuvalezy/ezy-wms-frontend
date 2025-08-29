import { PackageTransactionType } from './PackageTransactionType.enum';
import { ObjectType } from './ObjectType.enum';
import {UnitType} from "@/features/shared/data";

export interface PackageTransactionDto {
  id: string;
  packageId: string;
  transactionType: PackageTransactionType;
  itemCode: string;
  quantity: number;
  unitType: UnitType;
  sourceOperationType: ObjectType;
  sourceOperationId?: string;
  sourceOperationLineId?: string;
  userId: string;
  transactionDate: Date;
  notes?: string;
}