import { PackageTransactionType } from './PackageTransactionType.enum';
import { UnitType } from './UnitType.enum';
import { ObjectType } from './ObjectType.enum';

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