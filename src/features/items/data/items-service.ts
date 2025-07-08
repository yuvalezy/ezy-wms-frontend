import {axiosInstance} from "@/utils/axios-instance";
import {
  BinContentResponse,
  BinLocation,
  Item,
  ItemCheckResponse,
  ItemStockResponse,
  UpdateItemBarCodeResponse
} from "@/features/items/data/items";
import axios from "axios";

export const itemsService = {
  async scanBinLocation(bin: string): Promise<BinLocation | null> {
    try {
      const url = `items/scanBinLocation?bin=${bin}`;

      const response = await axiosInstance.get<BinLocation>(url);

      if (response.status === 404) {
        return null;
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error("Error canning barcode:", error);
      throw error;
    }
  },

  async scanBarcode(scanCode: string, item?: boolean): Promise<Item[]> {
    try {
      const url = `items/itemByBarCode?scanCode=${scanCode}&item=${item ?? false}`;

      const response = await axiosInstance.get<Item[]>(url);

      return response.data;
    } catch (error) {
      console.error("Error canning barcode:", error);
      throw error;
    }
  },


  async itemCheck(itemCode?: string, barcode?: string): Promise<ItemCheckResponse[]> {
    try {
      const url = `items/itemCheck`;

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
  },


  async updateItemBarCode(itemCode: string, removeBarcodes: string[], addBarcode: string): Promise<UpdateItemBarCodeResponse> {
    try {
      const url = `items/updateItemBarCode`;

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
  },

  async itemStock(itemCode: string,): Promise<ItemStockResponse[]> {
    try {
      const url = `items/itemStock`;

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
  },

  async binCheck(binEntry: number): Promise<BinContentResponse[]> {
    try {
      const url = `items/binCheck?binEntry=${binEntry}`;

      const response = await axiosInstance.get<BinContentResponse[]>(url);

      return response.data;
    } catch (error) {
      console.error("Error checking bin content:", error);
      throw error;
    }
  },
}