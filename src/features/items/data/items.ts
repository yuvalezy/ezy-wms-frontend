import {PackageStockValue} from "@/components";
import { ItemMetadataDefinition } from '../types/ItemMetadataDefinition.dto';

export type BinLocation = {
  entry: number;
  code: string;
  quantity: number;
}
export type ItemInfoResponse = {
  code: string;
  name: string;
  father: string;
  boxNumber?: number;
  barcode?: string;
  isPackage: boolean;
}

export enum ResponseStatus {
  Error = 'Error',
  Ok = 'Ok'
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
  customAttributes?: Record<string, any>;
  metadataDefinitions?: ItemMetadataDefinition[];
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

export enum CustomFieldType {
  Text = 'Text',
  Number = 'Number',
  Date = 'Date'
}

export interface CustomField {
  key: string;
  description: string;
  type: CustomFieldType;
}