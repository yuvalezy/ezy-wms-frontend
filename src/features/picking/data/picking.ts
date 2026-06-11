import {BinLocation, ItemDetails} from "@/features/items/data/items";
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
  salesOrders: string | null;
  invoices: string | null;
  transfers: string | null;
  remarks: String | null;
  status: PickStatus;
  syncStatus: SyncStatus;
  quantity: number;
  openQuantity: number;
  updateQuantity: number;
  pickPackOnly: boolean;
  checkStarted: boolean;
  hasCheck: boolean;
  hasRepack: boolean;
  repackStarted: boolean;
  repackCompleted: boolean;
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
}

export interface PickingDocumentDetailItemBinQuantities extends BinLocation {
  /** Numeric walk-order from the backend (IPickPathSequencer); lower comes first. */
  sequence?: number;
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

export interface PickingPackageLabelItem {
  itemCode: string;
  scannedQuantity: number;
  baseQuantity: number;
  unit: UnitType;
  binEntry?: number;
  lineCount: number;
}

export interface PickingPackageLabel {
  id: string;
  absEntry: number;
  whsCode: string;
  code: string;
  sequence: number;
  createdAt: Date;
  lineCount: number;
  totalQuantity: number;
  items: PickingPackageLabelItem[];
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

export interface PickingRepackItem {
  itemCode: string;
  unit: UnitType;
  totalQuantity: number;
  assignedQuantity: number;
  totalLines: number;
  assignedLines: number;
}

export interface PickingRepackSummary {
  pickListId: number;
  started: boolean;
  completed: boolean;
  startedAt?: Date;
  startedBy?: string;
  completedAt?: Date;
  totalLines: number;
  assignedLines: number;
  totalQuantity: number;
  assignedQuantity: number;
  labels: PickingPackageLabel[];
  items: PickingRepackItem[];
}

export interface PickingRepackAssignResponse {
  success: boolean;
  errorMessage?: string;
  summary?: PickingRepackSummary;
}
