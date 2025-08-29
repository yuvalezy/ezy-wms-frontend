import { PackageInconsistencyDto } from './PackageInconsistencyDto.dto';

export interface PackageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasInconsistencies: boolean;
  inconsistencies: PackageInconsistencyDto[];
}