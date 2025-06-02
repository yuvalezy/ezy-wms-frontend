import {Employee, UnitType} from "@/assets";
import {GoodsReceiptAllDetailMockup, transferMockup} from "@/assets";
import axios from "axios";
import {DetailUpdateParameters, ObjectAction, SourceTarget, Status} from "@/assets";
import { axiosInstance, Mockup } from "@/utils/axios-instance";

interface TransferAddItemResponse {
  lineID?: number
  closedTransfer: boolean;
  errorMessage?: string;
  unitMsr: string;
  numIn: number;
  packMsr: string;
  packUnit: number;
}

export type TransferDocument = {
  id: number;
  name?: string;
  date: string;
  employee: Employee;
  status: Status;
  statusDate: string;
  statusEmployee: Employee;
  progress?: number;
  comments?: string;
  isComplete?: boolean;
}

export type TransferContent = {
  code: string;
  name: string;
  quantity: number;
  unit: UnitType;
  numInBuy: number;
  buyUnitMsr: string;
  purPackUn: number;
  purPackMsr: string;
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
    if (Mockup) {
      console.log("Mockup data is being used.");
      return transferMockup;
    }

    

    

    
    const response = await axiosInstance.post<TransferDocument>(
      `Transfer/Create`, {name, comments},
      
    );

    return response.data;
  } catch (error) {
    console.error("Error creating transfer:", error);
    throw error;
  }
};
export const getProcessInfo = async (id: number): Promise<TransferDocument> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      const mockup = transferMockup;
      mockup.isComplete = true;
      return mockup;
    }

    

    

    
    const response = await axiosInstance.get<TransferDocument>(
      `Transfer/ProcessInfo/${id}`,
      
    );

    return response.data;
  } catch (error) {
    console.error("Error creating transfer:", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
  }
};

export type TransferUpdateParameters = {
  id?: number,
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
    if (Mockup) {
      console.log("Mockup data is being used.");
      return [transferMockup];
    }



    

    const queryParams = new URLSearchParams();
    queryParams.append("OrderBy", params.orderBy.toString());
    queryParams.append("Desc", params.desc.toString());

    params.statuses.forEach((status) =>
      queryParams.append("Status", status.toString())
    );

    if (params.id !== null && params.id !== undefined) {
      queryParams.append("ID", params.id.toString());
    }

    if (params.number !== null && params.number !== undefined) {
      queryParams.append("Number", params.number.toString());
    }

    if (params.date !== null && params.date !== undefined) {
      queryParams.append("Date", params.date.toISOString());
    }

    if (params.progress !== null && params.progress !== undefined) {
      queryParams.append("Progress", params.progress.toString());
    }

    const url = `Transfer/Transfers?${queryParams.toString()}`;

    const response = await axiosInstance.get<TransferDocument[]>(url, );

    return response.data;
  } catch (error) {
    console.error("Error fetching transfers:", error);
    throw error;
  }
};

export type addItemParameters = {
  id: number,
  itemCode: string,
  barcode?: string,
  type: SourceTarget,
  binEntry?: number,
  quantity?: number,
  unit: UnitType,
}

export const addItem = async (params: addItemParameters): Promise<TransferAddItemResponse> => {
  try {
    params.quantity ??= 1;
    if (Mockup) {
      //todo mockup
    }

    

    

    

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
    console.error("Error adding item:", error);
    throw error;
  }
}

export type transferContentParameters = {
  id: number
  type: SourceTarget
  binEntry?: number
  targetBins?: boolean
  itemCode?: string
  targetBinQuantity?: boolean
}
export const fetchTransferContent = async (params: transferContentParameters): Promise<TransferContent[]> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      //todo return mockup
    }



    

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
  lineID: number;
  employeeName: string;
  timeStamp: Date;
  quantity: number;
};
export const fetchTargetItemDetails = async (id: number, item: string, binEntry: number): Promise<TargetItemDetail[]> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      return GoodsReceiptAllDetailMockup;
    }

    

    const url = `Transfer/TransferContentTargetDetail`;

    const response = await axiosInstance.post<any[]>(url, {
      id: id,
      itemCode: item,
      binEntry: binEntry
    }, );

    const details: TargetItemDetail[] = response.data.map((item: any) => ({
      lineID: item.lineID,
      employeeName: item.employeeName,
      timeStamp: new Date(item.timeStamp),
      quantity: item.quantity
    }));

    return details;
  } catch (error) {
    console.error("Error fetching all details:", error);
    throw error;
  }
};
export const updateTransferTargetItem = async (data: DetailUpdateParameters) => {
  try {
    if (Mockup) {
      return;
    }

    

    

    

    const url = `Transfer/UpdateContentTargetDetail`;

    const response = await axiosInstance.post(url, data, );

    return response.data;
  } catch (error) {
    console.error("Error updating goods receipt:", error);
    throw error;
  }
}
export const transferAction = async (
  id: number,
  action: ObjectAction,
): Promise<boolean> => {
  try {
    if (Mockup) {
      if (action === "approve") {
        //todo
        return true;
      }
      console.log("Mockup data is being used.");
      return true;
    }

    

    

    
    const response = await axiosInstance.post<boolean>(
      `Transfer/${
        action === "approve" ? "Process" : "Cancel"
      }`,
      {
        ID: id,
      },
      
    );
    return response.data;
  } catch (error) {
    console.error("Error creating transfer: ", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
  }
};

export const createRequest = async (contents: TransferContent[]): Promise<number> => {
  try {
    // if (Mockup) {
    //     ...
    // }

    

    

    
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