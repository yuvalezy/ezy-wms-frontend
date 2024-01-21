import {configUtils, delay, globalConfig} from "../../../Assets/GlobalConfig";
import axios from "axios";

export type Process = {
    hello: number
}

interface CountingAddItemResponse {
    lineID?: number
    closedDocument: boolean;
    errorMessage?: string;
}

export const addItem = async (
    id: number,
    itemCode: string,
    barcode: string,
    binEntry?: number
) : Promise<CountingAddItemResponse> => {
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
                quantity: 1
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