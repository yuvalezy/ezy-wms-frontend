import {configUtils, delay, globalConfig} from "../../assets/GlobalConfig";
import axios from "axios";
import {
    GoodsReceiptMockup,
    goodsReceiptVSExitReportDataMockup,
} from "../../assets/mockup";

export type GoodsReceiptAll = {
    itemCode: string;
    itemName: string;
    quantity: number;
    delivery: number;
    showroom: number;
    stock: number;
};

export type GoodsReceiptVSExitReportData = {
    objectType: number;
    number: number;
    cardName: string;
    address: string;
    lines: GoodsReceiptVSExitReportDataLine[];
};

export type GoodsReceiptVSExitReportDataLine = {
    itemCode: string;
    itemName: string;
    openQuantity: number;
    quantity: number;
};

export const fetchGoodsReceiptReportAll = async (id: number): Promise<GoodsReceiptAll[]> => {
    try {
        if (!globalConfig)
            throw new Error("Config has not been initialized!");
        if (globalConfig.debug)
            await delay();
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return GoodsReceiptMockup;
        }

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/GoodsReceipt/GoodsReceiptAll/${id}`;

        const response = await axios.get<GoodsReceiptAll[]>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
    }
};
export const fetchGoodsReceiptVSExitReport = async (id: number): Promise<GoodsReceiptVSExitReportData[]> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return goodsReceiptVSExitReportDataMockup;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/GoodsReceipt/GoodsReceiptVSExitReport/${id}`;

        const response = await axios.get<GoodsReceiptVSExitReportData[]>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
    }
};
