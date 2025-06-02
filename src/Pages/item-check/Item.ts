import {itemMockup, itemStockMockup, updateItemBarMockup} from "@/assets/mockup";
import {ResponseStatus} from "@/assets/Common";
import {axiosInstance, Mockup } from "@/utils/axios-instance";

export interface ItemCheckResponse {
  itemCode: string;
  itemName: string;
  numInBuy: number;
  buyUnitMsr: string;
  purPackUn: number;
  purPackMsr: string;
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
    if (Mockup) {
      console.log("Mockup data is being used.");
      return itemMockup;
    }
    

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
    if (Mockup) {
      if (addBarcode) {
        itemMockup[0].barcodes.push(addBarcode);
      }
      if (removeBarcodes.length > 0) {
          itemMockup[0].barcodes = itemMockup[0].barcodes.filter(
              (barcode) => !removeBarcodes.includes(barcode)
          );
      }
      return updateItemBarMockup;
    }

    

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
    if (Mockup) {
      return itemStockMockup;
    }

    

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
