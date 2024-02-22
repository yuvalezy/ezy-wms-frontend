import {configUtils, delay, globalConfig} from "./GlobalConfig";
import {ReasonValueMockup} from "./mockup";
import axios from "axios";

export type ReasonValue = {
    value: number;
    description: string;
};

export enum ReasonType {
    GoodsReceipt = "GoodsReceipt",
    Counting = "Counting",
    Transfer = "Transfer",
}

export const fetchReasons = async (type: ReasonType): Promise<ReasonValue[]> => {
    if (configUtils.isMockup) {
        console.log("Mockup data is being used.");
        return ReasonValueMockup;
    }

    if (!globalConfig) throw new Error("Config has not been initialized!");

    if (globalConfig.debug) await delay();

    const access_token = localStorage.getItem("token");

    const response = await axios.get<ReasonValue[]>(
        `${globalConfig.baseURL}/api/${type}/CancelReasons`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );

    return response.data;
};
