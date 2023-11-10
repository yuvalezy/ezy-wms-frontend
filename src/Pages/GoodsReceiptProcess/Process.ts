import axios from "axios";
import {configUtils, delay, globalConfig} from "../../assets/GlobalConfig";
import {UpdateLineReturnValue} from "../GoodsReceiptSupervisor/Document";
import {addItemResponseMockup, UpdateLineReturnValueMockup,} from "../../assets/mockup";
import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";

interface AddItemResponse {
  lineID: number;
  closedDocument: boolean;
  fulfillment: boolean;
  showroom: boolean;
  warehouse: boolean;
  numInBuy: number;
}

export type AddItemResponseMultipleValue = {
  message: string;
  severity: MessageStripDesign;
};

export const addItem = async (
  id: number,
  itemCode: string,
  barcode: string
): Promise<AddItemResponse> => {
  try {
    if (configUtils.isMockup) {
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

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay();

    const access_token = localStorage.getItem("token");

    const url = `${globalConfig.baseURL}/api/GoodsReceipt/AddItem`;

    const response = await axios.post<AddItemResponse>(
      url,
      {
        id: id,
        itemCode: itemCode,
        barcode: barcode,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
};
export const updateLine = async ({
  id,
  lineID,
  comment,
  userName,
  reason,
  numInBuy,
}: {
  id: number;
  lineID: number;
  comment?: string;
  userName?: string;
  numInBuy?: number;
  reason?: number;
}): Promise<UpdateLineReturnValue> => {
  try {
    if (configUtils.isMockup) {
      console.log("Mockup data is being used.");
      return UpdateLineReturnValueMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay();

    const access_token = localStorage.getItem("token");

    const url = `${globalConfig.baseURL}/api/GoodsReceipt/UpdateLine`;

    const response = await axios.post<UpdateLineReturnValue>(
      url,
      {
        id: id,
        lineID: lineID,
        comment: comment,
        userName: userName,
        closeReason: reason,
        quantityInUnit: numInBuy,
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating line:", error);
    throw error;
  }
};