import {BinLocation, ItemDetails, ResponseStatus} from "@/features/items/data/items";
import {PackageContentDto} from "@/features/packages/types";
import {UnitType} from "@/features/shared/data";

export enum SyncStatus {
  Unknown = 'Unknown',
  Pending = 'Pending',
  Syncing = 'Syncing',
  Synced = 'Synced',
  Failed = 'Failed',
  Retry = 'Retry'
}

export type ProcessResponse = {
  ok: boolean,
  errorMessage?: string;
}

export enum PickStatus {
  Released = "Released",
  Picked = "Picked",
  PartiallyDelivered = "Delivered",
  Closed = "Closed"
}

export type PickingDocument = {
  entry: number;
  date: Date;
  salesOrders: number;
  invoices: number;
  transfers: number;
  remarks: String | null;
  status: PickStatus;
  syncStatus: SyncStatus;
  quantity: number;
  openQuantity: number;
  updateQuantity: number;
  pickPackOnly: boolean;
  checkStarted: boolean;
  hasCheck: boolean;
  detail?: PickingDocumentDetail[];
}
export type PickingDocumentDetail = {
  type: number;
  entry: number;
  number: number;
  date: Date;
  cardCode: string;
  cardName: string;
  items?: PickingDocumentDetailItem[];
  totalItems: number;
  totalOpenItems: number;
  customFields?: Record<string, unknown>;
}

export interface PickingDocumentDetailItem extends ItemDetails {
  quantity: number;
  picked: number;
  openQuantity: number;
  available?: number;
  binQuantities?: PickingDocumentDetailItemBinQuantities[];
  packages?: BinLocationPackageQuantityResponse[];
}

export interface PickingDocumentDetailItemBinQuantities extends BinLocation {
  packages?: BinLocationPackageQuantityResponse[];
}

export interface BinLocationPackageQuantityResponse {
  id: string;
  barcode: string;
  binEntry: number;
  itemCode: string;
  quantity: number;
  fullPackage: boolean;
}

export type pickingParameters = {
  id: number;
  type?: number;
  entry?: number;
  availableBins?: boolean;
  binLocation?: number
}
export type pickingsParameters = {
  id?: number;
  date?: Date;
  type?: number;
  entry?: number;
  detail?: boolean;
  availableBins?: boolean;
  displayCompleted?: boolean;
  status?: PickStatus[];
}

export interface PickingAddItemResponse {
  lineId: number;
  closedDocument: boolean;
  errorMessage?: string;
}

export interface ProcessPickListResponse {
  status: ResponseStatus;
  errorMessage?: string;
  closedDocument: boolean;
  packageId: string;
  packageContents: PackageContentDto[];
}

export interface ProcessPickListCancelResponse extends ProcessResponse {
  transferId?: string;
}

export interface PickListCheckSession {
  pickListId: number;
  startedByUserId: string;
  startedByUserName: string;
  startedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
}

export interface PickListCheckItemRequest {
  pickListId: number;
  itemCode: string;
  checkedQuantity: number;
  unit: UnitType;
  binEntry?: number;
}

export interface PickListCheckItemResponse {
  success: boolean;
  errorMessage?: string;
  itemsChecked: number;
  totalItems: number;
}

export interface PickListCheckSummaryResponse {
  pickListId: number;
  checkStartedAt: Date;
  checkStartedBy: string;
  totalItems: number;
  itemsChecked: number;
  discrepancyCount: number;
  items: PickListCheckItemDetail[];
}

export interface PickListCheckItemDetail {
  itemCode: string;
  itemName: string;
  pickedQuantity: number;
  checkedQuantity: number;
  difference: number;
  unitMeasure: string;
  quantityInUnit: number;
  packMeasure: string;
  quantityInPack: number;
}

export interface PickListCheckPackageResponse {
  errorMessage?: string;
  status: ResponseStatus;
  success: boolean;
  itemsChecked: number;
  totalItems: number;
  packageBarcode: string;
  checkedItems: CheckedPackageItem[];
}

export interface CheckedPackageItem {
  itemCode: string;
  itemName: string;
  quantity: number;
}