import {ResponseStatus} from "@/assets/Common";
import {axiosInstance } from "@/utils/axios-instance";


export interface ItemDetails {
  itemCode: string;
  itemName: string;
  numInBuy: number;
  buyUnitMsr?: string | null;
  purPackUn: number;
  purPackMsr?: string | null;
}

export interface ItemCheckResponse extends ItemDetails{
  barcodes: string[];
}

export interface ItemStockResponse {
  binCode: string;
  quantity: number;
}

export interface UpdateItemBarCodeResponse {
  existItem?: string;
  errorMessage?: string;
  status: ResponseStatus;
}

export const itemCheck = async (
  itemCode?: string,
  barcode?: string
): Promise<ItemCheckResponse[]> => {
  try {
    const url = `General/ItemCheck`;

    const response = await axiosInstance.post<ItemCheckResponse[]>(
      url,
      {
        itemCode: itemCode,
        barcode: barcode,
      },
      
    );

    return response.data;
  } catch (error) {
    console.error("Error checking item barcode:", error);
    throw error;
  }
};

export const updateItemBarCode = async (
  itemCode: string,
  removeBarcodes: string[],
  addBarcode: string
): Promise<UpdateItemBarCodeResponse> => {
  try {
    const url = `General/UpdateItemBarCode`;

    const response = await axiosInstance.post<UpdateItemBarCodeResponse>(
      url,
      {
        itemCode: itemCode,
        removeBarcodes: removeBarcodes,
        addBarcodes: addBarcode.length > 0 ? [addBarcode] : [],
      },
      
    );

    return response.data;
  } catch (error) {
    console.error("Error checking item barcode:", error);
    throw error;
  }
};
export const itemStock = async (
    itemCode: string,
): Promise<ItemStockResponse[]> => {
  try {
    const url = `General/ItemStock`;

    const response = await axiosInstance.post<ItemStockResponse[]>(
        url,
        {
          itemCode: itemCode,
        }
    );

    return response.data;
  } catch (error) {
    console.error("Error checking item barcode:", error);
    throw error;
  }
};
