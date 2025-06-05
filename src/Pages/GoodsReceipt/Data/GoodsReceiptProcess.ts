import {
  DocumentAddItemResponse,
  DocumentUpdateLineQuantityResponse,
  addItemResponseMockup,
  UpdateLineReturnValueMockup,
  UnitType,
  UpdateLineReturnValue
} from "@/assets";
import {axiosInstance, Mockup} from "@/utils/axios-instance";

export const addItem = async (
  id: string,
  itemCode: string,
  barcode: string,
  unit: UnitType
): Promise<DocumentAddItemResponse> => {
  try {
    if (Mockup) {
      switch (barcode) {
        case "approve": {
          return {...addItemResponseMockup, warehouse: true};
        }
        case "alert": {
          return {...addItemResponseMockup, fulfillment: true};
        }
        case "showroom": {
          return {...addItemResponseMockup, showroom: true};
        }
        case "cancel": {
          return {...addItemResponseMockup, closedDocument: true};
        }
        case "error": {
          return addItemResponseMockup;
        }
        default: {
          return {
            ...addItemResponseMockup,
            showroom: true,
            fulfillment: true,
            warehouse: true,
          };
        }
      }
    }

    

    

    

    const url = `GoodsReceipt/AddItem`;

    const response = await axiosInstance.post<DocumentAddItemResponse>(
      url,
      {
        id: id,
        itemCode: itemCode,
        barcode: barcode,
        unit: unit,
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
                                   userName,
                                   reason,
                                   quantity,
                                 }: {
  id: string;
  lineId: string;
  comment?: string;
  userName?: string;
  quantity?: number;
  reason?: number;
}): Promise<{returnValue: UpdateLineReturnValue, errorMessage?: string}> => {
  try {
    if (Mockup) {
      console.log("Mockup data is being used.");
      // return UpdateLineReturnValueMockup;
    }


    const url = `GoodsReceipt/UpdateLine`;

    const response = await axiosInstance.post<UpdateLineReturnValue>(
      url,
      {
        id: id,
        lineId: lineId,
        comment: comment,
        userName: userName,
        closeReason: reason,
        quantity: quantity,
      },
      
    );

    return {returnValue: response.data};
  } catch (error) {
    console.error("Error updating line:", error);
    throw error;
  }
};
export const updateLineQuantity = async ({
                                           id,
                                           lineId,
                                           userName,
                                           quantity,
                                         }: {
  id: string;
  lineId: string;
  userName?: string;
  quantity?: number;
}): Promise<DocumentUpdateLineQuantityResponse> => {
  try {
    // if (Mockup) {
    //   console.log("Mockup data is being used.");
    //   return UpdateLineReturnValueMockup;
    // }



    

    const url = `GoodsReceipt/UpdateLineQuantity`;

    const response = await axiosInstance.post<DocumentUpdateLineQuantityResponse>(
      url,
      {
        id: id,
        lineId: lineId,
        userName: userName,
        quantity: quantity,
      },
      
    );

    return response.data;
  } catch (error) {
    console.error("Error updating line quantity:", error);
    throw error;
  }
};
