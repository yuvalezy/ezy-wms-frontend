import {UpdateLineParameters, UpdateLineReturnValue} from "@/assets";
import { axiosInstance } from "@/utils/axios-instance";

export interface TransferAddItemResponse {
  lineId: number;
  closedTransfer: boolean;
  purPackUn: number;
  errorMessage?: string;
}

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
export const updateLine = async ({
                                   id,
                                   lineId,
                                   comment,
                                   reason,
                                   quantity,
                                 }: UpdateLineParameters): Promise<{returnValue: UpdateLineReturnValue, errorMessage?: string}> => {
  if (quantity != null) {
    return await updateLineQuantity(id, lineId, quantity);
  }
  try {
    const url = `transfer/updateLine`;

    const response = await axiosInstance.post<{returnValue: UpdateLineReturnValue, errorMessage?: string}>(
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
};
const updateLineQuantity = async (id: string, lineId: string, quantity: number): Promise<{returnValue: UpdateLineReturnValue, errorMessage?: string}> => {
  try {
    const url = `transfer/updateLineQuantity`;

    const response = await axiosInstance.post<{returnValue: UpdateLineReturnValue, errorMessage?: string}>(
      url,
      {id: id, lineId: lineId, quantity: quantity,}
    );

    return response.data;
  } catch (error) {
    console.error("Error updating line:", error);
    throw error;
  }
}
