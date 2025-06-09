import {
  UnitType,
  UpdateLineParameters,
  UpdateLineReturnValue
} from "@/assets";
import {axiosInstance} from "@/utils/axios-instance";

export type Process = {
  hello: number
}

interface CountingAddItemResponse {
  lineId?: string
  closedDocument: boolean;
  errorMessage?: string;
  unit: UnitType;
  unitMsr: string;
  numIn: number;
  packMsr: string;
  packUnit: number;
}

export const updateLine = async ({
                                   id,
                                   lineId,
                                   comment,
                                   reason,
                                   quantity
                                 }: UpdateLineParameters): Promise<UpdateLineReturnValue> => {
  try {
    const url = `Counting/UpdateLine`;

    const response = await axiosInstance.post<UpdateLineReturnValue>(
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
}


export const addItem = async (
  id: string,
  itemCode: string,
  barcode: string,
  binEntry: number | undefined,
  unit: UnitType): Promise<CountingAddItemResponse> => {
  try {
    const url = `Counting/AddItem`;

    const response = await axiosInstance.post<CountingAddItemResponse>(
      url,
      {
        id: id,
        itemCode: itemCode,
        barcode: barcode,
        binEntry: binEntry,
        quantity: 1,
        unit: unit
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
}