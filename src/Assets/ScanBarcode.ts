import {Item} from "./Common";
import {configUtils, delay, globalConfig} from "./GlobalConfig";
import {itemFatherMockup} from "./mockup";
import axios from "axios";

export const scanBarcode = async (
    scanCode: string,
    item?: boolean
): Promise<Item[]> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return itemFatherMockup;
        }
        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/General/ItemByBarCode?scanCode=${scanCode}&item=${item??false}`;

        const response = await axios.get<Item[]>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error canning barcode:", error);
        throw error;
    }
};
