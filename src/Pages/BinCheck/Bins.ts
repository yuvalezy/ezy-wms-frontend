import axios from "axios";
import {delay, globalConfig} from "../../Assets/GlobalConfig";

export interface BinContentResponse {
    itemCode: string;
    itemName: string;
    onHand: number;
    numInBuy: number;
    buyUnitMsr: string;
    purPackUn: number;
    purPackMsr: string;
}

export const binCheck = async (
    binEntry: number
): Promise<BinContentResponse[]> => {
    try {
        // if (configUtils.isMockup) {
        //     console.log("Mockup data is being used.");
        //     return itemMockup;
        // }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug)
            await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/General/BinCheck?binEntry=${binEntry}`;

        const response = await axios.get<BinContentResponse[]>(
            url,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error checking bin content:", error);
        throw error;
    }
};
