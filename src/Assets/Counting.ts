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