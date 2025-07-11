import {BaseEntity, Status, UnitType} from "@/features/shared/data";
import {ItemDetails} from "@/features/items/data/items";
import {PackageContentDto} from "@/features/packages/types";

export interface TransferDocument extends BaseEntity {
  name?: string;
  number: number;
  date: Date;
  status: Status;
  progress?: number;
  comments?: string;
  isComplete?: boolean;
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

export enum SourceTarget {
  Source = "Source",
  Target = "Target"
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

