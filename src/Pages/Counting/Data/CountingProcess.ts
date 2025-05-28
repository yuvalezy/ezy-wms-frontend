import {configUtils, delay, globalConfig} from "../../../assets/GlobalConfig";
import axios from "axios";
import {UpdateLineReturnValueMockup} from "../../../assets/mockup";
import {UnitType, UpdateLineParameters, UpdateLineReturnValue} from "../../../assets/Common";

export type Process = {
  hello: number
}

interface CountingAddItemResponse {
  lineID?: number
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
                                   lineID,
                                   comment,
                                   reason,
                                   quantity
                                 }: UpdateLineParameters): Promise<UpdateLineReturnValue> => {
  try {
    if (configUtils.isMockup) {
      console.log("Mockup data is being used.");
      return UpdateLineReturnValueMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay();

    const access_token = localStorage.getItem("token");

    const url = `${globalConfig.baseURL}/api/Counting/UpdateLine`;

    const response = await axios.post<UpdateLineReturnValue>(
      url,
      {
        id: id,
        lineID: lineID,
        comment: comment,
        closeReason: reason,
        quantity: quantity,
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
}


export const addItem = async (
  id: number,
  itemCode: string,
  barcode: string,
  binEntry: number | undefined,
  unit: UnitType): Promise<CountingAddItemResponse> => {
  try {
    if (configUtils.isMockup) {
      //todo mockup
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay();

    const access_token = localStorage.getItem("token");

    const url = `${globalConfig.baseURL}/api/Counting/AddItem`;

    const response = await axios.post<CountingAddItemResponse>(
      url,
      {
        id: id,
        itemCode: itemCode,
        barcode: barcode,
        binEntry: binEntry,
        quantity: 1,
        unit: unit
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
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