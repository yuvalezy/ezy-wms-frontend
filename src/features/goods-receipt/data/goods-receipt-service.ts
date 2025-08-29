import {axiosInstance} from "@/utils/axios-instance";

import {
  BusinessPartner,
  DocumentActionResponse,
  DocumentAddItemResponse,
  DocumentItem,
  DocumentOrderBy,
  DocumentUpdateLineQuantityResponse,
  GoodsReceiptReportFilter,
  GoodsReceiptType,
  ReceiptDocument
} from "@/features/goods-receipt/data/goods-receipt";
import {UnitType, UpdateLineReturnValue} from "@/features/shared/data";

export const goodsReceiptService = {
  async create(type: GoodsReceiptType, vendor: string, name: string, items: DocumentItem[]): Promise<ReceiptDocument> {
    try {
      const response = await axiosInstance.post<ReceiptDocument>(
        `GoodsReceipt/Create`,
        {
          vendor: vendor,
          name: name,
          type: type,
          documents: items,
          confirm
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error creating document:", error);
      throw error; // Re-throwing so that the calling function can decide what to do with the error
    }
  },

  async cancel(id: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get<boolean>(`goodsReceipt/cancel/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error cancel goods receipt: ", error);
      throw error;
    }
  },

  async process(id: string): Promise<DocumentActionResponse> {
    try {
      const response = await axiosInstance.get<DocumentActionResponse>(`goodsReceipt/process/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.errorMessage);
      }

      return response.data;
    } catch (error) {
      console.error("Error processing goods receipt: ", error);
      throw error;
    }
  },

  async fetch(id: string): Promise<ReceiptDocument> {
    try {
      const response = await axiosInstance.get<ReceiptDocument>(`goodsReceipt/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching document:", error);
      throw error;
    }
  },

  async fetchVendors(): Promise<BusinessPartner[]> {
    try {
      const response = await axiosInstance.get<BusinessPartner[]>(
        `General/Vendors`,
      );
      return response.data;
    } catch (error) {
      console.error("Error loading vendors:", error);
      throw error; // Re-throwing so that the calling function can decide what to do with the error
    }
  },

  async search(filters: GoodsReceiptReportFilter, orderBy: DocumentOrderBy = DocumentOrderBy.ID, desc: boolean = true): Promise<ReceiptDocument[]> {
    try {
      const url = `goodsReceipt`;

      const response = await axiosInstance.post<ReceiptDocument[]>(url, filters,);

      return response.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  async addItem(id: string, itemCode: string, barcode: string, unit: UnitType, startNewPackage: boolean, packageId?: string | null): Promise<DocumentAddItemResponse> {
    try {
      const url = `GoodsReceipt/AddItem`;

      const response = await axiosInstance.post<DocumentAddItemResponse>(url, {
          id,
          itemCode,
          barcode,
          unit,
          startNewPackage,
          packageId,
        },
      );
      if (response.data.errorMessage == null) {
        return response.data;
      } else {
        throw new Error(response.data.errorMessage);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      throw error;
    }
  },

  async updateLine({id, lineId, comment, userName, reason, quantity,}: {
    id: string;
    lineId: string;
    comment?: string;
    userName?: string;
    quantity?: number;
    reason?: number;
  }): Promise<{ returnValue: UpdateLineReturnValue, errorMessage?: string }> {
    try {
      const url = `GoodsReceipt/UpdateLine`;

      const response = await axiosInstance.post<UpdateLineReturnValue>(url, {
        id: id,
        lineId: lineId,
        comment: comment,
        userName: userName,
        closeReason: reason,
        quantity: quantity,
      },);

      return {returnValue: response.data};
    } catch (error) {
      console.error("Error updating line:", error);
      throw error;
    }
  },

  async updateLineQuantity({id, lineId, userName, quantity}: {
    id: string;
    lineId: string;
    userName?: string;
    quantity?: number;
  }): Promise<DocumentUpdateLineQuantityResponse> {
    try {
      const url = `GoodsReceipt/UpdateLineQuantity`;

      const response = await axiosInstance.post<DocumentUpdateLineQuantityResponse>(url, {
        id: id,
        lineId: lineId,
        userName: userName,
        quantity: quantity,
      },);

      return response.data;
    } catch (error) {
      console.error("Error updating line quantity:", error);
      throw error;
    }
  },
}
