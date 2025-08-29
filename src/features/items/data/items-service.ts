import {axiosInstance} from "@/utils/axios-instance";
import {BinContentResponse, BinLocation, ItemBinStockResponse, ItemCheckResponse, ItemDetails, ItemInfoResponse, UpdateItemBarCodeResponse} from "@/features/items/data/items";
import {MetadataDefinition} from "../types";
import {UpdateItemMetadataRequest} from "@/features/items";
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

  async scanBarcode(scanCode: string, item?: boolean): Promise<ItemInfoResponse[]> {
    try {
      const url = `items/itemByBarCode?scanCode=${scanCode}&item=${item ?? false}`;

      const response = await axiosInstance.get<ItemInfoResponse[]>(url);

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

  async itemStock(itemCode: string,): Promise<ItemBinStockResponse[]> {
    try {
      const url = `items/itemStock`;

      const response = await axiosInstance.post<ItemBinStockResponse[]>(url, {itemCode: itemCode,});

      return response.data;
    } catch (error) {
      console.error("Error checking item stock:", error);
      throw error;
    }
  },

  async itemBinStock(itemCode: string,): Promise<ItemBinStockResponse[]> {
    try {
      const url = `items/itemBinStock`;

      const response = await axiosInstance.post<ItemBinStockResponse[]>(url, {itemCode: itemCode,});

      return response.data;
    } catch (error) {
      console.error("Error checking item bin stock:", error);
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

  async getItemMetadataDefinitions(): Promise<MetadataDefinition[]> {
    try {
      const url = `general/item-metadata-definitions`;

      const response = await axiosInstance.get<MetadataDefinition[]>(url);

      return response.data;
    } catch (error) {
      console.error("Error getting item metadata definitions:", error);
      throw error;
    }
  },

  async getItemMetadata(itemCode: string): Promise<{ metadata: Record<string, any> }> {
    try {
      const url = `items/${encodeURIComponent(itemCode)}/metadata`;

      const response = await axiosInstance.get<{ metadata: Record<string, any> }>(url);

      return response.data;
    } catch (error) {
      console.error("Error getting item metadata:", error);
      throw error;
    }
  },

  async updateItemMetadata(itemCode: string, request: UpdateItemMetadataRequest): Promise<ItemDetails> {
    try {
      const url = `items/${encodeURIComponent(itemCode)}/metadata`;

      const response = await axiosInstance.put<ItemDetails>(url, request);

      return response.data;
    } catch (error) {
      console.error("Error updating item metadata:", error);
      throw error;
    }
  },
};

// Export individual functions for use in hooks
export const updateItemMetadata = itemsService.updateItemMetadata;
export const getItemMetadataDefinitions = itemsService.getItemMetadataDefinitions;
export const getItemMetadata = itemsService.getItemMetadata;