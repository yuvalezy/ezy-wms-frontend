import axios from "axios";
import {configUtils, delay, globalConfig} from "@/assets";
import {transferAddItemResponseMockup, UpdateLineReturnValueMockup} from "@/assets";
import {UpdateLineParameters, UpdateLineReturnValue} from "@/assets";

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
        if (configUtils.isMockup) {
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

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/Transfer/AddItem`;

        const response = await axios.post<TransferAddItemResponse>(
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
export const updateLine = async ({ id, lineID, comment, reason, quantity, }: UpdateLineParameters): Promise<UpdateLineReturnValue> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return UpdateLineReturnValueMockup;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/Transfer/UpdateLine`;

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
};