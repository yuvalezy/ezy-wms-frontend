import {axiosInstance} from "@/utils/axios-instance";

import {
  AddItemParameters,
  TargetItemDetail, TransferActionResponse,
  TransferAddItemResponse, TransferContent, transferContentParameters,
  TransferDocument,
  TransfersOrderBy,
  TransferUpdateParameters,
  TransferAddSourcePackageRequest,
  TransferAddTargetPackageRequest
} from "@/features/transfer/data/transfer";
import {
  AddItemReturnValueType,
  DetailUpdateParameters,
  Status,
  UpdateLineParameters,
  UpdateLineReturnValue
} from "@/assets";
import axios from "axios";
import {getAddItemErrorMessage} from "@/utils/error-handler";

export const transferService = {
  async create(name: string, comments: string,): Promise<TransferDocument> {
    try {
      const response = await axiosInstance.post<TransferDocument>(
        `transfer/create`, {name, comments},
      );

      return response.data;
    } catch (error) {
      console.error("Error creating transfer:", error);
      throw error;
    }
  },

  async cancel(id: string): Promise<boolean> {
    try {
      const response = await axiosInstance.post<boolean>(`Transfer/Cancel`, {id});
      return response.data;
    } catch (error) {
      console.error("Error cancel transfer: ", error);
      throw error;
    }
  },

  async process(id: string): Promise<TransferActionResponse> {
    try {
      const response = await axiosInstance.post<TransferActionResponse>(`Transfer/Process`, {id});

      if (!response.data.success) {
        throw new Error(response.data.errorMessage);
      }

      return response.data;
    } catch (error) {
      console.error("Error processing processing: ", error);
      throw error;
    }
  },

  async getProcessInfo(id: string): Promise<TransferDocument> {
    try {
      const response = await axiosInstance.get<TransferDocument>(
        `transfer/processInfo/${id}`,
      );

      return response.data;
    } catch (error) {
      console.error("Error creating transfer:", error);
      throw error; // Re-throwing so that the calling function can decide what to do with the error
    }
  },

  async search(params: TransferUpdateParameters): Promise<TransferDocument[]> {
    if (params.statuses == null)
      params.statuses = params.id == null ? [Status.Open, Status.InProgress] : [];
    if (params.orderBy == null)
      params.orderBy = TransfersOrderBy.ID;
    if (params.desc == null)
      params.desc = true;
    if (params.progress == null)
      params.progress = false;

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("orderBy", params.orderBy.toString());
      queryParams.append("desc", params.desc.toString());

      params.statuses.forEach((status) =>
        queryParams.append("status", status.toString())
      );

      if (params.id !== null && params.id !== undefined) {
        queryParams.append("id", params.id.toString());
      }

      if (params.number !== null && params.number !== undefined) {
        queryParams.append("number", params.number.toString());
      }

      if (params.date !== null && params.date !== undefined) {
        queryParams.append("date", params.date.toISOString());
      }

      if (params.progress !== null && params.progress !== undefined) {
        queryParams.append("progress", params.progress.toString());
      }

      const url = `transfer?${queryParams.toString()}`;

      const response = await axiosInstance.get<TransferDocument[]>(url);

      return response.data;
    } catch (error) {
      console.error("Error fetching transfers:", error);
      throw error;
    }
  },

  /*

export const addItem = async (
  id: number,
  itemCode: string,
  barcode: string
): Promise<TransferAddItemResponse> => {
  try {
    const url = `transfer/addItem`;

    const response = await axiosInstance.post<TransferAddItemResponse>(
      url,
      {
        id: id,
        itemCode: itemCode,
        barcode: barcode,
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
};
   */

  async addItem(params: AddItemParameters, t: (key: string) => string): Promise<TransferAddItemResponse> {
    try {
      params.quantity ??= 1;

      const url = `Transfer/AddItem`;

      const response = await axiosInstance.post<TransferAddItemResponse>(url, params,);
      if (response.data.errorMessage == null) {
        return response.data;
      } else {
        throw new Error(response.data.errorMessage);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.response.data.ErrorId) {

          const errorType = error.response.data.ErrorId as AddItemReturnValueType;
          const errorData = error.response.data.ErrorData;
          const errorMessage = getAddItemErrorMessage(errorType, errorData, t);
          return {
            closedTransfer: false, lineId: "", numIn: 0, packMsr: "", packUnit: 0, unitMsr: "", unit: params.unit,
            errorMessage: errorMessage
          }
        }
      }
      console.error("Error adding item:", error);
      throw error;
    }
  },

  async updateLine({
                     id,
                     lineId,
                     comment,
                     reason,
                     quantity,
                   }: UpdateLineParameters): Promise<{ returnValue: UpdateLineReturnValue, errorMessage?: string }> {
    if (quantity != null) {
      return await transferService.updateLineQuantity(id, lineId, quantity);
    }
    try {
      const url = `transfer/updateLine`;

      const response = await axiosInstance.post<{ returnValue: UpdateLineReturnValue, errorMessage?: string }>(
        url,
        {
          id: id,
          lineId: lineId,
          comment: comment,
          closeReason: reason,
          quantity: quantity,
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error updating line:", error);
      throw error;
    }
  },

  async updateLineQuantity(id: string, lineId: string, quantity: number): Promise<{
    returnValue: UpdateLineReturnValue,
    errorMessage?: string
  }> {
    try {
      const url = `transfer/updateLineQuantity`;

      const response = await axiosInstance.post<{ returnValue: UpdateLineReturnValue, errorMessage?: string }>(
        url,
        {id: id, lineId: lineId, quantity: quantity,}
      );

      return response.data;
    } catch (error) {
      console.error("Error updating line:", error);
      throw error;
    }
  },

  async fetchContent(params: transferContentParameters): Promise<TransferContent[]> {
    try {
      const url = `Transfer/TransferContent`;

      const response = await axiosInstance.post<TransferContent[]>(
        url,
        params,
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching transfer content:", error);
      throw error;
    }
  },

  async fetchTargetItemDetails(id: string, item: string, binEntry: number): Promise<TargetItemDetail[]> {
    try {
      const url = `Transfer/TransferContentTargetDetail`;

      const response = await axiosInstance.post<TargetItemDetail[]>(url, {
        id: id,
        itemCode: item,
        binEntry: binEntry
      },);

      return response.data;
    } catch (error) {
      console.error("Error fetching all details:", error);
      throw error;
    }
  },

  async updateTransferTargetItem(data: DetailUpdateParameters) {
    try {
      const url = `Transfer/UpdateContentTargetDetail`;

      const response = await axiosInstance.post(url, data,);

      return response.data;
    } catch (error) {
      console.error("Error updating goods receipt:", error);
      throw error;
    }
  },

  async createRequest(contents: TransferContent[]): Promise<number> {
    try {
      const response = await axiosInstance.post<number>(
        `Transfer/CreateTransferRequest`,
        contents,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating transfer request: ", error);
      throw error; // Re-throwing so that the calling function can decide what to do with the error
    }
  },

  async addSourcePackage(request: TransferAddSourcePackageRequest): Promise<TransferAddItemResponse> {
    try {
      const response = await axiosInstance.post<TransferAddItemResponse>(
        `transfer/addSourcePackage`,
        request
      );
      
      if (response.data.errorMessage) {
        throw new Error(response.data.errorMessage);
      }
      
      return response.data;
    } catch (error) {
      console.error("Error adding source package:", error);
      throw error;
    }
  },

  async addTargetPackage(request: TransferAddTargetPackageRequest): Promise<TransferAddItemResponse> {
    try {
      const response = await axiosInstance.post<TransferAddItemResponse>(
        `transfer/addTargetPackage`,
        request
      );
      
      if (response.data.errorMessage) {
        throw new Error(response.data.errorMessage);
      }
      
      return response.data;
    } catch (error) {
      console.error("Error adding target package:", error);
      throw error;
    }
  },


}
