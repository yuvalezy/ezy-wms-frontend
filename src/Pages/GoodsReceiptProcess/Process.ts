import axios from "axios";
import { AlertColor } from "@mui/material";
import { globalConfig } from "../../assets/GlobalConfig";
import { UpdateLineReturnValue } from "../GoodsReceiptSupervisor/Document";
import {
  UpdateLineReturnValueMockup,
  addItemResponseMockup,
} from "../../assets/mockup";
import { Console } from "console";

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
  severity: AlertColor;
};

export const addItem = async (
  mockup: boolean,
  id: number,
  itemCode: string,
  barcode: string
): Promise<AddItemResponse> => {
  try {
    if (mockup) {
      switch (barcode) {
        case "approve": {
          const approve = { ...addItemResponseMockup, warehouse: true };
          return approve;
        }
        case "alert": {
          const alert = { ...addItemResponseMockup, fulfillment: true };
          return alert;
        }
        case "showroom": {
          const showroom = { ...addItemResponseMockup, showroom: true };
          return showroom;
        }
        case "cancel": {
          const cancel = { ...addItemResponseMockup, closedDocument: true };
          return cancel;
        }
        case "error": {
          return addItemResponseMockup;
        }
        default: {
          const defaultValue = {
            ...addItemResponseMockup,
            showroom: true,
            fulfillment: true,
            warehouse: true,
          };

          return defaultValue;
        }
      }
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay(500);

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
  mockup,
  id,
  lineID,
  comment,
  userName,
  reason,
  numInBuy,
}: {
  mockup: boolean;
  id: number;
  lineID: number;
  comment?: string;
  userName?: string;
  numInBuy?: number;
  reason?: number;
}): Promise<UpdateLineReturnValue> => {
  try {
    if (mockup) {
      console.log("Mockup data is being used.");
      return UpdateLineReturnValueMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay(500);

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
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
