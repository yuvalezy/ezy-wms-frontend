export enum RoleType {
  GOODS_RECEIPT = 'GoodsReceipt',
  GOODS_RECEIPT_SUPERVISOR = 'GoodsReceiptSupervisor',
  GOODS_RECEIPT_CONFIRMATION = 'GoodsReceiptConfirmation',
  GOODS_RECEIPT_CONFIRMATION_SUPERVISOR = 'GoodsReceiptConfirmationSupervisor',
  PICKING = 'Picking',
  PICKING_SUPERVISOR = 'PickingSupervisor',
  COUNTING = 'Counting',
  COUNTING_SUPERVISOR = 'CountingSupervisor',
  COUNTING_CORRECTION = 'CountingCorrection',
  TRANSFER = 'Transfer',
  TRANSFER_SUPERVISOR = 'TransferSupervisor',
  TRANSFER_REQUEST = 'TransferRequest',
  TRANSFER_CONFIRMATION = 'TransferConfirmation',
  TRANSFER_CONFIRMATION_SUPERVISOR = 'TransferConfirmationSupervisor',
  ITEM_MANAGEMENT = 'ItemManagement',
  ITEM_MANAGEMENT_SUPERVISOR = 'ItemManagementSupervisor',
  DIRECT_TRANSFER = 'DirectTransfer',
}

export interface AuthorizationGroup {
  id: string;
  name: string;
  description?: string;
  authorizations: RoleType[];
  canDelete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthorizationGroupFormData {
  name: string;
  description?: string;
  authorizations: RoleType[];
}

export interface AuthorizationGroupFilters {
  searchTerm?: string;
}

export interface RoleInfo {
  role: RoleType;
  displayName: string;
  description: string;
  category: string;
}
