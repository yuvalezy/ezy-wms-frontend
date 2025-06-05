import {BusinessPartner, Employee} from "./Data";
import {GoodsReceiptType} from "@/pages/GoodsReceipt/data/Document";
import {BaseEntity, Status, UpdateLineReturnValue} from "./Common";

export interface Document extends BaseEntity {
  name?: string;
  number: number;
  date: Date;
  status: Status;
  businessPartner?: BusinessPartner;
  type: GoodsReceiptType;
  error: boolean;
  errorCode?: number;
  errorParameters?: any[];
  documents?: DocumentItem[];
  createdByUserName?: string;
}

export type DocumentItem = {
  objType: number;
  docNumber: number;
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

export type DocumentStatusOption = {
  code: string;
  name: string;
  status: Status;
};

export type ProcessResponse = {
  ok: boolean,
  errorMessage?: string;
}