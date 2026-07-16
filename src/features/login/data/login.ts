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
  customFields: Record<string, CustomField[]>;
  superUser: boolean;
  /**
   * The reports this user can run, name-ordered — one menu entry each. Recomputed live by the
   * backend on every `/general/UserInfo` call, never a login-time snapshot, so a fresh grant (or a
   * newly created report) appears without a re-login — unlike `roles`, which is snapshotted at
   * login. It rides a request the app already makes on each refresh, so the menu costs no extra
   * fetch. Empty means the Reports group disappears entirely.
   */
  reports: UserReportLink[];
  deviceStatus?: DeviceStatus;
  deviceName?: string;
}

export interface DocumentUnitSettings {
  defaultUnitType?: UnitType;
  enableUnitSelection?: boolean;
  enableUseBaseUn?: boolean;
  maxUnitLevel?: UnitType;
}

export interface ResolvedUnitSettings {
  defaultUnitType: UnitType;
  enableUnitSelection: boolean;
  enableUseBaseUn: boolean;
  maxUnitLevel?: UnitType;
}

export interface ApplicationSettings {
  // General
  scannerMode: ScannerMode;
  displayVendor: boolean;
  whsCodeBinSuffix: boolean;
  // Unit
  enableUseBaseUn: boolean;
  unitLabel?: string;
  unitAbbr?: string;
  dozensLabel?: string;
  dozensAbbr?: string;
  boxLabel?: string;
  boxAbbr?: string;
  maxUnitLevel?: UnitType;
  // Goods Receipt
  goodsReceiptDraft: boolean;
  goodsReceiptModificationSupervisor: boolean;
  goodsReceiptCreateSupervisorRequired: boolean;
  goodsReceiptType: GoodsReceiptDocumentType;
  goodsReceiptTargetDocuments: boolean;
  // Transfer
  transferTargetItems: boolean;
  enableTransferConfirm: boolean;
  enableTransferRequest: boolean;
  enableWarehouseTransfer: boolean;
  transferCreateSupervisorRequired: boolean;
  directTransferAll: boolean;
  // Units
  defaultUnitType: UnitType;
  enableUnitSelection: boolean;
  // System
  idleLogoutTimeout?: number | null;
  // Pick List
  enablePickingCheck: boolean;
  enablePickPathRouting: boolean;
  pickPathHuecoPrefix?: string;
  pickPathSectionFirst?: boolean;
  enablePickingPackageLabels?: boolean;
  enablePostPickRepack?: boolean;
  pickingPackageLabelPrefix?: string;
  // Quantities
  enableDecimalQuantities: boolean;
  // Per-document-type unit overrides
  documentUnitOverrides?: Record<string, DocumentUnitSettings>;
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

/** One report as the navigation menu needs it: a label and a destination. */
export interface UserReportLink {
  slug: string;
  name: string;
}
