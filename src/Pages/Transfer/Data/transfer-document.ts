import {
  AddItemReturnValueType,
  BaseEntity,
  DetailUpdateParameters,
  ObjectAction,
  SourceTarget,
  Status,
  UnitType
} from "@/assets";
import {axiosInstance} from "@/utils/axios-instance";
import { getAddItemErrorMessage } from "@/utils/error-handler";
import axios from "axios";
import {ItemDetails} from "@/pages/item-check/item-check";

interface TransferAddItemResponse {
  lineId?: string
  closedTransfer: boolean;
  errorMessage?: string;
  unitMsr: string;
  numIn: number;
  packMsr: string;
  packUnit: number;
}

export interface TransferDocument extends BaseEntity {
  name?: string;
  number: number;
  date: Date;
  status: Status;
  progress?: number;
  comments?: string;
  isComplete?: boolean;
}

export interface TransferContent extends ItemDetails {
  quantity: number;
  unit: UnitType;
  openQuantity: number;
  binQuantity?: number;
  progress?: number;
  bins?: TransferContentBin[];
}
export type TransferContentBin = {
  entry: number;
  code: string;
  quantity: number;
}

export enum TransfersOrderBy {
  ID = "ID",
  Date = "Date",
}

export const createTransfer = async (
  name: string,
  comments: string,
): Promise<TransferDocument> => {
  try {
    const response = await axiosInstance.post<TransferDocument>(
      `transfer/create`, {name, comments},
    );

    return response.data;
  } catch (error) {
    console.error("Error creating transfer:", error);
    throw error;
  }
};
export const getProcessInfo = async (id: string): Promise<TransferDocument> => {
  try {
    const response = await axiosInstance.get<TransferDocument>(
      `transfer/processInfo/${id}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error creating transfer:", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
  }
};

export type TransferUpdateParameters = {
  id?: string,
  statuses?: Status[];
  date?: Date | null,
  number?: number,
  orderBy?: TransfersOrderBy;
  desc?: boolean;
  progress?: boolean
}
export const fetchTransfers = async (params: TransferUpdateParameters): Promise<TransferDocument[]> => {
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
};

export type addItemParameters = {
  id: string,
  itemCode: string,
  barcode?: string,
  type: SourceTarget,
  binEntry?: number,
  quantity?: number,
  unit: UnitType,
}

export const addItem = async (params: addItemParameters, t: (key: string) => string): Promise<TransferAddItemResponse> => {
  try {
    params.quantity ??= 1;

    const url = `Transfer/AddItem`;

    const response = await axiosInstance.post<TransferAddItemResponse>(
      url,
      params,
    );
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
          closedTransfer: false, lineId: "", numIn: 0, packMsr: "", packUnit: 0, unitMsr: "",
          errorMessage: errorMessage
        }
      }
    }
    console.error("Error adding item:", error);
    throw error;
  }
}

export type transferContentParameters = {
  id: string
  type: SourceTarget
  binEntry?: number
  targetBins?: boolean
  itemCode?: string
  targetBinQuantity?: boolean
}
export const fetchTransferContent = async (params: transferContentParameters): Promise<TransferContent[]> => {
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
}
export type TargetItemDetail = {
  lineId: string;
  employeeName: string;
  timeStamp: Date;
  quantity: number;
};

export const fetchTargetItemDetails = async (id: string, item: string, binEntry: number): Promise<TargetItemDetail[]> => {
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
};
export const updateTransferTargetItem = async (data: DetailUpdateParameters) => {
  try {
    const url = `Transfer/UpdateContentTargetDetail`;

    const response = await axiosInstance.post(url, data,);

    return response.data;
  } catch (error) {
    console.error("Error updating goods receipt:", error);
    throw error;
  }
}
interface TransferActionResponse {
  success: boolean;
  externalEntry: string | null;
  externalNumber: string | null;
  errorMessage: string;
  status: string;
}

export const transferAction = async (
  id: string,
  action: ObjectAction,
): Promise<boolean | TransferActionResponse> => {
  try {
    const url = `Transfer/${action === "approve" ? "Process" : "Cancel"}`;
    
    if (action === "cancel") {
      const response = await axiosInstance.post<boolean>(
        url,
        {id},
      );
      return response.data;
    } else {
      const response = await axiosInstance.post<TransferActionResponse>(
        url,
        {id},
      );
      
      if (!response.data.success) {
        throw new Error(response.data.errorMessage);
      }
      
      return response.data;
    }
  } catch (error) {
    console.error("Error processing transfer: ", error);
    throw error;
  }
};

export const createRequest = async (contents: TransferContent[]): Promise<number> => {
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
}