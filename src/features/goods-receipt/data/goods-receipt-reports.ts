import {Status, UnitType} from "@/features/shared/data";
import {PackageValue} from "@/components";
import {ItemDetails} from "@/features/items/data/items";

export type GoodsReceiptAll = {
  status: Status;
  lines: GoodsReceiptAllLine[];
};

export interface GoodsReceiptAllLine extends ItemDetails {
  quantity: number;
  delivery: number;
  showroom: number;
  stock: number;
}

export type GoodsReceiptAllDetail = {
  lineId: string;
  createdByUserName: string;
  timeStamp: Date;
  quantity: number;
  unit: UnitType;
  package?: PackageValue;
};

export type GoodsReceiptVSExitReportData = {
  objectType: number;
  number: number;
  cardName: string;
  address: string;
  lines: GoodsReceiptVSExitReportDataLine[];
};

export type GoodsReceiptVSExitReportDataLine = {
  itemCode: string;
  itemName: string;
  openQuantity: number;
  quantity: number;
  numInBuy: number;
  buyUnitMsr?: string | null;
  purPackUn: number;
  purPackMsr?: string | null;
};

export type GoodsReceiptValidateProcess = {
  documentNumber: number;
  vendor: {id: string, name: string}
  baseType: number;
  baseEntry: number;
  lines: GoodsReceiptValidateProcessLine[];
}

export interface GoodsReceiptValidateProcessLine extends ItemDetails {
  visualLineNumber: number;
  lineNumber: number;
  quantity: number;
  baseLine: string;
  documentQuantity: number;
  unit: UnitType;
  lineStatus: ProcessLineStatus;
}

export type GoodsReceiptValidateProcessLineDetails = {
  timeStamp: string;
  createdByUserName: string;
  quantity: number;
  scannedQuantity: number;
  unit: UnitType;
}

export enum ProcessLineStatus {
  OK = 'OK',
  LessScan = 'LessScan',
  MoreScan = 'MoreScan',
  ClosedLine = 'ClosedLine',
  NotReceived = 'NotReceived'
}

