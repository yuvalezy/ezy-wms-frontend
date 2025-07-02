import { PackageTransactionType } from './PackageTransactionType.enum';
import { UnitType } from './UnitType.enum';
import { ObjectType } from './ObjectType.enum';

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