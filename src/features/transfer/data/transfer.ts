import {BaseEntity, LineStatus, Status, UnitType} from "@/features/shared/data";
import {ItemDetails} from "@/features/items/data/items";
import {PackageContentDto} from "@/features/packages/types";
import {User} from "@/features/users/data/user";

export enum SourceTarget {
  Source = "Source",
  Target = "Target"
}

export enum ApprovalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3
}

export enum ApprovalObjectType {
  Transfer = 1,
  GoodsReceipt = 2,
  InventoryCounting = 3
}

export interface ApprovalWorkflow extends BaseEntity {
  objectId: string;
  objectType: ApprovalObjectType;
  requestedByUserId: string;
  requestedByUser?: User;
  requestedAt: Date;
  approvalStatus: ApprovalStatus;
  reviewedByUserId?: string;
  reviewedByUser?: User;
  reviewedAt?: Date;
  rejectionReason?: string;
  reviewComments?: string;
}

export interface TransferLineResponse {
  barCode: string;
  itemCode: string;
  id: string;
  quantity: number;
  lineStatus: LineStatus;
  type: SourceTarget;
  unitType: UnitType;
  date: Date;
  binEntry?: number;
  comments?: string;
  statusReason?: number;
  cancellationReasonId?: string;
  cancellationReasonName?: string;
  transferId: string;
  transferNumber?: number;
  transferName?: string;
  createdAt: Date;
  createdByUserId?: string;
  createdByUserName?: string;
  updatedAt?: Date;
  updatedByUserId?: string;
  updatedByUserName?: string;
}

export interface TransferDocument extends BaseEntity {
  name?: string;
  number: number;
  date: Date;
  status: Status;
  progress?: number;
  comments?: string;
  isComplete?: boolean;
  whsCode?: string; // Source warehouse code
  sourceWhsCode?: string; // Alternative source warehouse code field
  targetWhsCode?: string;
  lines?: TransferLineResponse[];
  approvalWorkflow?: ApprovalWorkflow;
}

export enum TransfersOrderBy {
  ID = "ID",
  Date = "Date",
}

export type TransferUpdateParameters = {
  id?: string,
  statuses?: Status[];
  date?: Date | null,
  number?: number,
  orderBy?: TransfersOrderBy;
  desc?: boolean;
  progress?: boolean
}

export interface TransferAddItemResponse {
  lineId: string;
  quantity?: number;
  closedTransfer: boolean;
  unit: UnitType;
  unitMsr: string;
  numIn: number;
  packMsr: string;
  packUnit: number;
  errorMessage?: string;
  packageContents?: PackageContentDto[] | null;
}

export interface TransferContent extends ItemDetails {
  quantity: number;
  unit: UnitType;
  openQuantity: number;
  binQuantity?: number;
  progress?: number;
  bins?: TransferContentBin[];
}

export type TransferContentBin = {
  entry: number;
  code: string;
  quantity: number;
}

export type AddItemParameters = {
  id: string,
  itemCode: string,
  barcode?: string,
  type: SourceTarget,
  binEntry?: number,
  quantity?: number,
  unit: UnitType,
}
export type transferContentParameters = {
  id: string
  type: SourceTarget
  binEntry?: number
  targetBins?: boolean
  itemCode?: string
  targetBinQuantity?: boolean
}
export type TargetItemDetail = {
  lineId: string;
  employeeName: string;
  timeStamp: Date;
  quantity: number;
};

export interface TransferActionResponse {
  success: boolean;
  externalEntry: string | null;
  externalNumber: string | null;
  errorMessage: string;
  status: string;
}

export interface TransferAddSourcePackageRequest {
  transferId: string;
  packageId: string;
  binEntry?: number;
}

export interface TransferAddTargetPackageRequest {
  transferId: string;
  packageId: string;
  targetBinEntry?: number;
}

export interface TransferApprovalRequest {
  transferId: string;
  approved: boolean;
  rejectionReason?: string;
}

