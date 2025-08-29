import {axiosInstance} from "@/utils/axios-instance";
import {DetailUpdateParameters} from "@/features/shared/data";
import {
  GoodsReceiptAll,
  GoodsReceiptAllDetail,
  GoodsReceiptValidateProcess,
  GoodsReceiptValidateProcessLineDetails,
  GoodsReceiptVSExitReportData
} from "@/features/goods-receipt/data/goods-receipt-reports";

export const goodsReceiptReportService = {

  async fetchReportAll(id: string): Promise<GoodsReceiptAll> {
    try {
      const url = `goodsReceipt/${id}/report/all`;

      const response = await axiosInstance.get<GoodsReceiptAll>(url,);

      return response.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  async fetchReportAllDetails(id: string, item: string): Promise<GoodsReceiptAllDetail[]> {
    try {
      const url = `goodsReceipt/${id}/report/all/${encodeURIComponent(item)}`;
      const response = await axiosInstance.get<any[]>(url,);

      return response.data;
    } catch (error) {
      console.error("Error fetching all details:", error);
      throw error;
    }
  },

  async updateReport(data: DetailUpdateParameters) {
    try {
      const url = `goodsReceipt/updateAll`;

      const response = await axiosInstance.post(url, data,);

      return response.data;
    } catch (error) {
      console.error("Error updating goods receipt:", error);
      throw error;
    }
  },

  async fetchVSExitReport(id: string): Promise<GoodsReceiptVSExitReportData[]> {
    try {
      const url = `goodsReceipt/${id}/report/vsExit`;

      const response = await axiosInstance.get<GoodsReceiptVSExitReportData[]>(url,);

      return response.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  async fetchValidateProcess(id: string): Promise<GoodsReceiptValidateProcess[]> {
    try {
      const url = `goodsReceipt/${id}/validateProcess`;

      const response = await axiosInstance.get<GoodsReceiptValidateProcess[]>(url,);

      return response.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  async fetchValidateProcessLineDetails(id: string, baseType: number, baseEntry: number, baseLine: number): Promise<GoodsReceiptValidateProcessLineDetails[]> {
    try {
      const url = `goodsReceipt/validateProcessLineDetails`;

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
  },
}
