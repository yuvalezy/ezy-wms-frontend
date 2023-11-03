import axios from "axios";
import { globalConfig } from "../../assets/GlobalConfig";
import { ResponseStatus } from "../../assets/Common";
import { itemMockup, updateItemBarMockup } from "../../assets/mockup";

export interface ItemCheckResponse {
  itemCode: string;
  itemName: string;
  numInBuy: number;
  barcodes: string[];
}

export interface UpdateItemBarCodeResponse {
  existItem?: string;
  errorMessage?: string;
  status: ResponseStatus;
}
export const itemCheck = async (
  mockup: boolean,
  itemCode?: string,
  barcode?: string
): Promise<ItemCheckResponse[]> => {
  try {
    if (mockup) {
      console.log("Mockup data is being used.");
      return itemMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay(500);

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
  mockup: boolean,
  itemCode: string,
  removeBarcodes: string[],
  addBarcode: string
): Promise<UpdateItemBarCodeResponse> => {
  try {
    if (mockup) {
      console.log("Mockup data is being used.");
      return updateItemBarMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay(500);

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

// const [checkedBarcodes, setCheckedBarcodes] = React.useState<string[]>([]);
// const [newBarcodeInput, setNewBarcodeInput] = React.useState('');
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
