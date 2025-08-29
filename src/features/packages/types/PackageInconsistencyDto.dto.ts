import { InconsistencyType } from './InconsistencyType.enum';
import { InconsistencySeverity } from './InconsistencySeverity.enum';

export interface PackageInconsistencyDto {
  id: string;
  packageId: string;
  packageBarcode?: string;
  itemCode?: string;
  batchNo?: string;
  serialNo?: string;
  whsCode?: string;
  binCode?: string;
  sapQuantity?: number;
  wmsQuantity?: number;
  packageQuantity?: number;
  inconsistencyType: InconsistencyType;
  severity: InconsistencySeverity;
  detectedAt: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionAction?: string;
  errorMessage?: string;
  notes?: string;
}