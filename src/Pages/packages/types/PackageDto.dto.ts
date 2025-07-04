import { PackageStatus } from './PackageStatus.enum';
import { PackageContentDto } from './PackageContentDto.dto';
import { PackageLocationHistoryDto } from './PackageLocationHistoryDto.dto';
import {UserAuditResponse} from "@/assets";

export interface PackageDto {
  id: string;
  barcode: string;
  status: PackageStatus;
  whsCode: string;
  binEntry?: number;
  binCode?: string;
  createdBy?: UserAuditResponse;
  createdAt: Date;
  closedAt?: Date;
  closedBy?: string;
  notes?: string;
  customAttributes?: Record<string, any>;
  contents: PackageContentDto[];
  locationHistory?: PackageLocationHistoryDto[];
}