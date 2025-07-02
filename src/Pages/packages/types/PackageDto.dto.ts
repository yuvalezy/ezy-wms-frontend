import { PackageStatus } from './PackageStatus.enum';
import { PackageContentDto } from './PackageContentDto.dto';
import { PackageLocationHistoryDto } from './PackageLocationHistoryDto.dto';

export interface PackageDto {
  id: string;
  barcode: string;
  status: PackageStatus;
  whsCode: string;
  binEntry?: number;
  binCode?: string;
  createdBy: string;
  createdAt: Date;
  closedAt?: Date;
  closedBy?: string;
  notes?: string;
  customAttributes?: Record<string, any>;
  contents: PackageContentDto[];
  locationHistory?: PackageLocationHistoryDto[];
}