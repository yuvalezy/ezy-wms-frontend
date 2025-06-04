import {Employee} from "./Data";
import {BaseEntity, Status} from "./Common";

export enum OrderBy {
  ID = "ID",
  Name = "Name",
  Date = "Date",
}

export interface Counting extends BaseEntity {
  name?: string;
  number: number;
  date: Date;
  status: Status;
  error: boolean;
  errorCode?: number;
  errorParameters?: any[];
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