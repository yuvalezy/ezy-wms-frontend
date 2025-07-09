import {ResponseStatus} from "@/assets";
import {PackageStockValue} from "@/components";

export type BinLocation = {
  entry: number;
  code: string;
  quantity: number;
}
export type Item = {
  code: string;
  name: string;
  father: string;
  boxNumber?: number;
  barcode?: string;
}

export interface UpdateItemBarCodeResponse {
  existItem?: string;
  errorMessage?: string;
  status: ResponseStatus;
}

export interface ItemDetails {
  itemCode: string;
  itemName: string;
  numInBuy: number;
  buyUnitMsr?: string | null;
  purPackUn: number;
  purPackMsr?: string | null;
  customFields?: Record<string, unknown>;
}

export interface ItemCheckResponse extends ItemDetails {
  barcodes: string[];
}

export interface ItemStockResponse {
  binCode: string;
  binEntry: number;
  quantity: number;
  packages?: PackageStockValue[] | null;
}

export interface BinContentResponse extends ItemDetails {
  onHand: number;
  packages?: PackageStockValue[] | null;
}