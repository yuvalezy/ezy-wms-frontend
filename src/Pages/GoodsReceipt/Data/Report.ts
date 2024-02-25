import axios from "axios";
import {configUtils, delay, globalConfig} from "../../../Assets/GlobalConfig";
import {GoodsReceiptAllDetailMockup, GoodsReceiptMockup, goodsReceiptVSExitReportDataMockup} from "../../../Assets/mockup";
import {DetailUpdateParameters} from "../../../Assets/Common";

export type GoodsReceiptAll = {
    itemCode: string;
    itemName: string;
    quantity: number;
    delivery: number;
    showroom: number;
    stock: number;
};
export type GoodsReceiptAllDetail = {
    lineID: number;
    employeeName: string;
    timeStamp: Date;
    quantity: number;
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
export const fetchGoodsReceiptReportAllDetails = async (id: number, item: string): Promise<GoodsReceiptAllDetail[]> => {
    try {
        if (!globalConfig)
            throw new Error("Config has not been initialized!");
        if (globalConfig.debug)
            await delay();
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return GoodsReceiptAllDetailMockup;
        }

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/GoodsReceipt/GoodsReceiptAll/${id}/${item}`;

        const response = await axios.get<any[]>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const goodsReceipts: GoodsReceiptAllDetail[] = response.data.map((item: any) => ({
            lineID: item.lineID,
            employeeName: item.employeeName,
            timeStamp: new Date(item.timeStamp),
            quantity: item.quantity
        }));

        return goodsReceipts;
    } catch (error) {
        console.error("Error fetching all details:", error);
        throw error;
    }
};
export const updateGoodsReceiptReport = async(data: DetailUpdateParameters) => {
    try {
        if (configUtils.isMockup) {
            return;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/GoodsReceipt/UpdateGoodsReceiptAll`;

        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error updating goods receipt:", error);
        throw error;
    }
}
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
