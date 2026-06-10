import {ObjectType} from "@/features/shared/data";

export interface CancellationReason {
  id: string;
  name: string;
  isEnabled: boolean;
  transfer: boolean;
  goodsReceipt: boolean;
  counting: boolean;
  canDelete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CancellationReasonFormData {
  name: string;
  transfer: boolean;
  goodsReceipt: boolean;
  counting: boolean;
  isEnabled?: boolean;
}

export interface CancellationReasonFilters {
  searchTerm?: string;
  objectType?: ObjectType;
  includeDisabled?: boolean;
}

