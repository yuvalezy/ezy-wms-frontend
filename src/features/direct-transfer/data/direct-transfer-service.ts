import {axiosInstance} from "@/utils/axios-instance";

export interface DirectTransferRequest {
  sourceBinEntry: number;
  itemCode: string;
  targetBinEntry: number;
  quantity: number;
  unitCode: string;
}

export interface DirectTransferResponse {
  success: boolean;
  errorMessage: string | null;
}

export const directTransferService = {
  async execute(request: DirectTransferRequest): Promise<DirectTransferResponse> {
    try {
      const response = await axiosInstance.post<DirectTransferResponse>(
        `directTransfer/execute`,
        request
      );

      if (!response.data.success && response.data.errorMessage) {
        throw new Error(response.data.errorMessage);
      }

      return response.data;
    } catch (error) {
      console.error("Error executing direct transfer:", error);
      throw error;
    }
  },
};
