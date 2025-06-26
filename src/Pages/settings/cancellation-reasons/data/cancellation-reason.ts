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

export enum ObjectType {
  GOODS_RECEIPT = 'GoodsReceipt',
  INVENTORY_COUNTING = 'InventoryCounting',
  TRANSFER = 'Transfer',
  PICKING = 'Picking'
}

export enum SyncStatus {
  Pending = 'Pending',
  Syncing = 'Syncing',
  Synced = 'Synced',
  Failed = 'Failed',
  Retry = 'Retry'
}