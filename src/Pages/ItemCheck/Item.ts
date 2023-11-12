import axios from "axios";
import {delay, globalConfig, configUtils} from "../../Assets/GlobalConfig";
import { ResponseStatus } from "../../Assets/Common";
import { itemMockup, updateItemBarMockup } from "../../Assets/mockup";

export interface ItemCheckResponse {
  itemCode: string;
  itemName: string;
  purPackUn: number;
  barcodes: string[];
}

export interface UpdateItemBarCodeResponse {
  existItem?: string;
  errorMessage?: string;
  status: ResponseStatus;
}

export const itemCheck = async (
  itemCode?: string,
  barcode?: string
): Promise<ItemCheckResponse[]> => {
  try {
    if (configUtils.isMockup) {
      console.log("Mockup data is being used.");
      return itemMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug)
      await delay();

    const access_token = localStorage.getItem("token");

    const url = `${globalConfig.baseURL}/api/General/ItemCheck`;

    const response = await axios.post<ItemCheckResponse[]>(
      url,
      {
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
    console.error("Error checking item barcode:", error);
    throw error;
  }
};

export const updateItemBarCode = async (
  itemCode: string,
  removeBarcodes: string[],
  addBarcode: string
): Promise<UpdateItemBarCodeResponse> => {
  try {
    if (configUtils.isMockup) {
      if (addBarcode) {
        itemMockup[0].barcodes.push(addBarcode);
      }
      if (removeBarcodes.length > 0) {
          itemMockup[0].barcodes = itemMockup[0].barcodes.filter(
              (barcode) => !removeBarcodes.includes(barcode)
          );
      }
      return updateItemBarMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay();

    const access_token = localStorage.getItem("token");

    const url = `${globalConfig.baseURL}/api/General/UpdateItemBarCode`;

    const response = await axios.post<UpdateItemBarCodeResponse>(
      url,
      {
        itemCode: itemCode,
        removeBarcodes: removeBarcodes,
        addBarcodes: addBarcode.length > 0 ? [addBarcode] : [],
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error checking item barcode:", error);
    throw error;
  }
};