import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {Warehouse} from "@/features/users/data/user";
import {CustomField} from "@/features/items/data/items";
import {DeviceStatus} from "@/features/devices/data/device";
import {UnitType} from "@/features/shared/data";

export interface UserInfo {
  id: string;
  name: string;
  roles: RoleType[];
  warehouses: Warehouse[];
  currentWarehouse: string;
  binLocations: boolean;
  settings: ApplicationSettings;
  customFields: Record<string, CustomField[]>;
  superUser: boolean;
  deviceStatus?: DeviceStatus;
}

export interface ApplicationSettings {
  enablePackages: boolean;
  goodsReceiptDraft: boolean;
  goodsReceiptModificationSupervisor: boolean;
  goodsReceiptCreateSupervisorRequired: boolean;
  goodsReceiptTargetDocuments: boolean;
  transferTargetItems: boolean;
  goodsReceiptType: GoodsReceiptDocumentType;
  defaultUnitType: UnitType;
  enableUnitSelection: boolean;
  idleLogoutTimeout?: number | null;
  enablePickingCheck: boolean;
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