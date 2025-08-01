import {BaseEntity, ProcessType, Status, UpdateLineReturnValue} from "@/features/shared/data";

export enum GoodsReceiptType {
  All = "All",
  SpecificOrders = "SpecificOrders",
  SpecificReceipts = "SpecificReceipts",
  SpecificTransfers = "SpecificTransfers"
}

export type BusinessPartner = {
  id: string;
  name: string;
};

export interface ReceiptDocument extends BaseEntity {
  name?: string;
  number: number;
  date: Date;
  status: Status;
  vendor?: BusinessPartner;
  type: GoodsReceiptType;
  error: boolean;
  errorCode?: number;
  errorParameters?: any[];
  documents?: DocumentItem[];
  createdByUserName?: string;
}

export type DocumentItem = {
  objectType: number;
  documentEntry?: number;
  documentNumber: number;
};

export enum DocumentOrderBy {
  ID = "ID",
  Name = "Name",
  Date = "Date",
}

export interface DocumentAddItemResponse {
  lineId: string;
  closedDocument: boolean;
  fulfillment: boolean;
  showroom: boolean;
  warehouse: boolean;
  quantity: number;
  numInBuy: number;
  buyUnitMsr: string;
  purPackUn: number;
  purPackMsr: string;
  errorMessage?: string;
  customFields?: Record<string, unknown>;
  packageId?: string | null;
  packageBarcode?: string | null;
}

export interface DocumentUpdateLineQuantityResponse {
  closedDocument: boolean;
  fulfillment: boolean;
  showroom: boolean;
  warehouse: boolean;
  quantity: number;
  returnValue: UpdateLineReturnValue;
  errorMessage?: string;
}

export type GoodsReceiptReportFilter = {
  processType: ProcessType;
  number?: number | null;
  vendor?: string | null;
  name?: string;
  grpo?: string;
  purchaseOrder?: string;
  reservedInvoice?: string;
  goodsReceipt?: string;
  purchaseInvoice?: string;
  transfer?: string;
  statuses?: Status[] | null;
  date?: Date | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  orderBy?: DocumentOrderBy | null;
  orderByDesc?: boolean | null;
  pageSize?: number | null;
  pageNumber?: number | null;
  lastId?: string | null;
}

export interface DocumentActionResponse {
  success: boolean;
  documentNumber: string | null;
  errorMessage: string;
  status: string;
}