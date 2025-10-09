import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {Warehouse} from "@/features/users/data/user";
import {CustomField} from "@/features/items/data/items";
import {DeviceStatus} from "@/features/devices/data/device";
import {UnitType} from "@/features/shared/data";
import {MetadataDefinition} from "@/features/items/types";

export interface UserInfo {
  id: string;
  name: string;
  roles: RoleType[];
  warehouses: Warehouse[];
  currentWarehouse: string;
  binLocations: boolean;
  settings: ApplicationSettings;
  itemMetaData: MetadataDefinition[],
  packageMetaData: MetadataDefinition[],
  customFields: Record<string, CustomField[]>;
  superUser: boolean;
  deviceStatus?: DeviceStatus;
}

export interface ApplicationSettings {
  // General
  enableUseBaseUn: boolean;
  scannerMode: ScannerMode;
  displayVendor: boolean;
  whsCodeBinSuffix: boolean;
  // Goods Receipt
  goodsReceiptDraft: boolean;
  goodsReceiptModificationSupervisor: boolean;
  goodsReceiptCreateSupervisorRequired: boolean;
  goodsReceiptType: GoodsReceiptDocumentType;
  goodsReceiptTargetDocuments: boolean;
  goodsReceiptPackages: boolean;
  // Transfer
  transferTargetItems: boolean;
  enableTransferConfirm: boolean;
  enableTransferRequest: boolean;
  // Packages & Units
  enablePackages: boolean;
  defaultUnitType: UnitType;
  enableUnitSelection: boolean;
  // System
  idleLogoutTimeout?: number | null;
  // Pick List
  enablePickingCheck: boolean;
  // Quantities
  enableDecimalQuantities: boolean;
}

export enum GoodsReceiptDocumentType {
  Transactional = "Transactional",
  Confirmation = "Confirmation",
  Both = "Both"
}

export interface LoginRequest {
  password: string;
  warehouse?: string;
  newDeviceName?: string;
}

export interface ErrorResponse {
  error: string;
  error_description: string;
}

export enum ScannerMode {
  ItemBarcode = 'ItemBarcode',
  ItemCode = 'ItemCode'
}