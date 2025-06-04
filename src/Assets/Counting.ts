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
  code: string;
  name: string;
  quantity: number;
  unit?: number;
  dozen?: number;
  pack?: number;
}