import {
  GoodsReceiptAllDetailMockup,
  GoodsReceiptMockup,
  goodsReceiptVSExitReportDataMockup
} from "@/assets";
import {DetailUpdateParameters, UnitType} from "@/assets";
import {axiosInstance, Mockup} from "@/utils/axios-instance";

export type GoodsReceiptAll = {
  itemCode: string;
  itemName: string;
  quantity: number;
  delivery: number;
  showroom: number;
  stock: number;
  numInBuy: number;
  buyUnitMsr?: string | null;
  purPackUn: number;
  purPackMsr?: string | null;
};
export type GoodsReceiptAllDetail = {
  lineId: string;
  createdByUserName: string;
  timeStamp: Date;
  quantity: number;
  unit: UnitType;
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

export type GoodsReceiptValidateProcessLine = {
  visualLineNumber: number;
  lineNumber: number;
  itemCode: string;
  itemName: string;
  quantity: number;
  baseLine: string;
  documentQuantity: number;
  numInBuy: number;
  buyUnitMsr: string;
  purPackUn: number;
  purPackMsr: string;
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

export const fetchGoodsReceiptReportAll = async (id: string): Promise<GoodsReceiptAll[]> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      return GoodsReceiptMockup;
    }

    const url = `goodsReceipt/${id}/report/all`;

    const response = await axiosInstance.get<GoodsReceiptAll[]>(url,);

    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
export const fetchGoodsReceiptReportAllDetails = async (id: string, item: string): Promise<GoodsReceiptAllDetail[]> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      return GoodsReceiptAllDetailMockup;
    }

    const url = `goodsReceipt/${id}/report/all/${item}`;

    const response = await axiosInstance.get<any[]>(url,);

    return response.data;
  } catch (error) {
    console.error("Error fetching all details:", error);
    throw error;
  }
};
export const updateGoodsReceiptReport = async (data: DetailUpdateParameters) => {
  try {
    if (Mockup) {
      return;
    }

    const url = `goodsReceipt/updateAll`;

    const response = await axiosInstance.post(url, data,);

    return response.data;
  } catch (error) {
    console.error("Error updating goods receipt:", error);
    throw error;
  }
}
export const fetchGoodsReceiptVSExitReport = async (id: number): Promise<GoodsReceiptVSExitReportData[]> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      return goodsReceiptVSExitReportDataMockup;
    }
    const url = `GoodsReceipt/GoodsReceiptVSExitReport/${id}`;

    const response = await axiosInstance.get<GoodsReceiptVSExitReportData[]>(url,);

    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
export const fetchGoodsReceiptValidateProcess = async (id: string): Promise<GoodsReceiptValidateProcess[]> => {
  try {
    const url = `goodsReceipt/${id}/validateProcess`;

    const response = await axiosInstance.get<GoodsReceiptValidateProcess[]>(url,);

    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
export const fetchGoodsReceiptValidateProcessLineDetails = async (id: string, baseType: number, baseEntry: number, baseLine: number): Promise<GoodsReceiptValidateProcessLineDetails[]> => {
  try {
    const url = `GoodsReceipt/validateProcessLineDetails`;

    const response = await axiosInstance.post<GoodsReceiptValidateProcessLineDetails[]>(url, {
      id: id,
      baseType: baseType,
      baseEntry: baseEntry,
      baseLine: baseLine
    },);

    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
