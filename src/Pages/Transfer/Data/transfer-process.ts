import axios from "axios";
import {transferAddItemResponseMockup, UpdateLineReturnValueMockup} from "@/assets";
import {UpdateLineParameters, UpdateLineReturnValue} from "@/assets";
import { axiosInstance, Mockup } from "@/utils/axios-instance";

export interface TransferAddItemResponse {
  lineID: number;
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
    if (Mockup) {
      switch (barcode) {
        case "cancel": {
          return {...transferAddItemResponseMockup, closedTransfer: true};
        }
        case "error": {
          return transferAddItemResponseMockup;
        }
        default: {
          return {
            ...transferAddItemResponseMockup,
          };
        }
      }
    }

    

    

    

    const url = `Transfer/AddItem`;

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
                                   lineID,
                                   comment,
                                   reason,
                                   quantity,
                                 }: UpdateLineParameters): Promise<UpdateLineReturnValue> => {
  if (Mockup) {
    console.log("Mockup data is being used.");
    return UpdateLineReturnValueMockup;
  }

  if (quantity != null) {
    return await updateLineQuantity(id, lineID, quantity);
  }
  try {
    

    

    

    const url = `Transfer/UpdateLine`;

    const response = await axiosInstance.post<UpdateLineReturnValue>(
      url,
      {
        id: id,
        lineID: lineID,
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
const updateLineQuantity = async (id: number, lineID: number, quantity: number): Promise<UpdateLineReturnValue> => {
  try {
    

    

    

    const url = `Transfer/UpdateLineQuantity`;

    const response = await axiosInstance.post<UpdateLineReturnValue>(
      url,
      {id: id, lineID: lineID, quantity: quantity,}
    );

    return response.data;
  } catch (error) {
    console.error("Error updating line:", error);
    throw error;
  }
}

