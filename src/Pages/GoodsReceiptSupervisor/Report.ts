import {globalConfig} from "../../assets/GlobalConfig";
import axios from "axios";

export type GoodsReceiptVSExitReportData = {
    ObjectType: number;
    Number: number;
    CardName: string;
    Address: string;
    Lines: GoodsReceiptVSExitReportDataLine[];
}

export type GoodsReceiptVSExitReportDataLine = {
    ItemCode: string;
    ItemName: string;
    OpenQuantity: number;
    Quantity: number;
}
export const fetchGoodsReceiptVSExitReport = async (
    id: number,
): Promise<GoodsReceiptVSExitReportData[]> => {
    try {
        if (!globalConfig)
            throw new Error('Config has not been initialized!');

        if (globalConfig.debug)
            await delay(500);

        const access_token = localStorage.getItem('token');

        const url = `${globalConfig.baseURL}/api/GoodsReceipt/GoodsReceiptVSExitReport/${id}`;

        const response = await axios.get<GoodsReceiptVSExitReportData[]>(url,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

        return response.data;
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
    }
};
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
