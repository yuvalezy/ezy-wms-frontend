import {BaseEntity, Status, UnitType} from "@/features/shared/data";
import {ItemDetails} from "@/features/items/data/items";

export interface Counting extends BaseEntity {
  name?: string;
  number: number;
  date: Date;
  status: Status;
  error: boolean;
  errorCode?: number;
  errorParameters?: any[];
}

export interface CountingActionResponse {
  success: boolean;
  externalEntry: string | null;
  externalNumber: string | null;
  errorMessage: string;
  status: string;
}

export interface CountingAddItemResponse {
  lineId?: string
  closedDocument: boolean;
  errorMessage?: string;
  unit: UnitType;
  unitMsr: string;
  numIn: number;
  packMsr: string;
  packUnit: number;
  packageId?: string | null;
  packageBarcode?: string | null;
}

export type CountingSummaryReportData = {
  countingId: string;
  number: number;
  name: string;
  date: string;
  whsCode: string;
  totalLines: number;
  processedLines: number;
  varianceLines: number;
  totalSystemValue: number;
  totalCountedValue: number;
  totalVarianceValue: number;
  lines: CountingSummaryReportLine[];
}

export interface CountingSummaryReportLine extends ItemDetails {
  binCode: string;
  quantity: number;
}

export enum OrderBy {
  ID = "ID",
  Name = "Name",
  Date = "Date",
}

export type CountingContent = {
  itemCode: string;
  itemName: string;
  binEntry?: number;
  binCode?: string;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  systemValue: number;
  countedValue: number;
  varianceValue: number;
  buyUnitMsr?: string;
  numInBuy: number;
  purPackMsr?: string;
  purPackUn: number;
}