import {configUtils, delay, globalConfig} from "../../../Assets/GlobalConfig";
import {addItemResponseMockup, PickingDetailItemsMockup, PickingDetailsMockup, PickingMockup, processResponseMockup} from "../../../Assets/mockup";
import axios from "axios";
import {ProcessResponse} from "../../../Assets/Document";
import {BinLocation} from "../../../Assets/Common";

export enum PickStatus {
    Released = "Released",
    Picked = "Picked",
    Closed = "Closed"
}

export type PickingDocument = {
    entry: number;
    date: Date;
    salesOrders: number;
    invoices: number;
    transfers: number;
    remarks: String | null;
    status: PickStatus;
    quantity: number;
    openQuantity: number;
    updateQuantity: number;
    detail?: PickingDocumentDetail[];
}
export type PickingDocumentDetail = {
    type: number;
    entry: number;
    number: number;
    date: Date;
    cardCode: string;
    cardName: string;
    items?: PickingDocumentDetailItem[];
    totalItems: number;
    totalOpenItems: number;
}

export type PickingDocumentDetailItem = {
    itemCode: string;
    itemName: string;
    quantity: number;
    picked: number;
    openQuantity: number;
    binQuantities?: BinLocation[];
}

export type pickingsParameters = {
    id?: number;
    date?: Date;
    type?: number;
    entry?: number;
    detail?: boolean;
    availableBins?: boolean;
}

export interface PickingAddItemResponse {
    lineID: number;
    closedDocument: boolean;
    errorMessage?: string;
}

export const fetchPicking = async (id: number, type?: number, entry?: number, availableBins?: boolean): Promise<PickingDocument> => {
    try {
        if (configUtils.isMockup) {
            await delay();
            console.log("Mockup data is being used.");
            let picking = PickingMockup[0];
            if (type == null) {
                picking.detail = PickingDetailsMockup;
            }
            else {
                picking.detail = PickingDetailsMockup.filter((v) => v.type === type && v.entry === entry);
                picking.detail.forEach(v => v.items = PickingDetailItemsMockup);
            }
            return picking;
        }

        if (!globalConfig)
            throw new Error("Config has not been initialized!");

        if (globalConfig.debug)
            await delay();

        const access_token = localStorage.getItem("token");

        const queryParams = new URLSearchParams();

        if (type != null) {
            queryParams.append("type", type.toString());
        }
        if (entry != null) {
            queryParams.append("entry", entry.toString());
        }

        if (availableBins != null && availableBins) {
            queryParams.append("availableBins", "true");
        }

        const url = `${
            globalConfig.baseURL
        }/api/Picking/Picking/${id}?${queryParams.toString()}`;

        const response = await axios.get<PickingDocument>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching pickings:", error);
        throw error;
    }
}
export const fetchPickings = async (params?: pickingsParameters): Promise<PickingDocument[]> => {
    try {
        if (configUtils.isMockup) {
            await delay();
            console.log("Mockup data is being used.");
            let pickingMockup = PickingMockup;
            if (params?.detail ?? false) {
                let picking = pickingMockup[0];
                picking.detail = PickingDetailsMockup;
                return [picking];
            }
            if (params?.type != null) {
                let picking = pickingMockup[0];
                picking.detail = PickingDetailsMockup.filter((v) => v.type === params?.type && v.entry === params?.entry);
                picking.detail.forEach(v => {
                    v.items = PickingDetailItemsMockup;
                })
                return [picking];
            }
            return pickingMockup;
        }

        if (!globalConfig)
            throw new Error("Config has not been initialized!");

        if (globalConfig.debug)
            await delay();

        const access_token = localStorage.getItem("token");

        const queryParams = new URLSearchParams();
        if (params != null) {
            if (params.id !== undefined) {
                queryParams.append("id", params.id.toString());
            }
            if (params.date !== null && params.date !== undefined) {
                queryParams.append("date", params.date.toISOString());
            }

            if (params.availableBins) {
                queryParams.append("availableBins", "true");
            }
        }

        const url = `${
            globalConfig.baseURL
        }/api/Picking/Pickings?${queryParams.toString()}`;

        const response = await axios.get<PickingDocument[]>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching pickings:", error);
        throw error;
    }
}
export const addItem = async (
    id: number,
    type: number,
    entry: number,
    itemCode: string,
    quantity: number,
): Promise<PickingAddItemResponse> => {
    try {
        if (configUtils.isMockup) {
            return {
                ...addItemResponseMockup,
            };
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/Picking/AddItem`;

        const response = await axios.post<PickingAddItemResponse>(
            url,
            {
                id: id,
                type: type,
                entry: entry,
                itemCode: itemCode,
                quantity: quantity
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
export const processPicking = async (
    id: number,
): Promise<ProcessResponse> => {
    try {
        if (configUtils.isMockup) {
            return {
                ...processResponseMockup,
            };
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/Picking/Process`;

        const response = await axios.post<ProcessResponse>(
            url,
            { id: id },
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
        console.error("Error process picking:", error);
        throw error;
    }
};
