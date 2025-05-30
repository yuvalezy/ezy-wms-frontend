import {configUtils, delay, globalConfig} from "@/assets";
import {addItemResponseMockup, PickingDetailItemsMockup, PickingDetailsMockup, PickingMockup, processResponseMockup} from "@/assets";
import axios from "axios";
import {ProcessResponse} from "@/assets";
import {BinLocation} from "@/assets";

export enum PickStatus {
    Released = "Released",
    Picked = "Picked",
    PartiallyDelivered = "Delivered",
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
    available?: number;
    binQuantities?: BinLocation[];
}

export type pickingParameters = {
    id: number;
    type?: number;
    entry?: number;
    availableBins?: boolean;
    binLocation?: number
}
export type pickingsParameters = {
    id?: number;
    date?: Date;
    type?: number;
    entry?: number;
    detail?: boolean;
    availableBins?: boolean;
    status?: PickStatus[];
}

export interface PickingAddItemResponse {
    lineID: number;
    closedDocument: boolean;
    errorMessage?: string;
}

export const fetchPicking = async (params: pickingParameters): Promise<PickingDocument> => {
    try {
        if (configUtils.isMockup) {
            await delay();
            console.log("Mockup data is being used.");
            let picking = PickingMockup[0];
            if (params.type == null) {
                picking.detail = PickingDetailsMockup;
            }
            else {
                picking.detail = PickingDetailsMockup.filter((v) => v.type === params.type && v.entry === params.entry);
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

        if (params.type != null) {
            queryParams.append("type", params.type.toString());
        }
        if (params.entry != null) {
            queryParams.append("entry", params.entry.toString());
        }

        if (params.availableBins != null && params.availableBins) {
            queryParams.append("availableBins", "true");
        }

        if (params.binLocation != null) {
            queryParams.append("binEntry", params.binLocation.toString());
        }

        const url = `${
            globalConfig.baseURL
        }/api/Picking/Picking/${params.id}?${queryParams.toString()}`;

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
export interface addItemParameters {
    id: number,
    type: number,
    entry: number,
    itemCode: string,
    quantity: number,
    binEntry: number,
}
export const addItem = async (params: addItemParameters): Promise<PickingAddItemResponse> => {
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
            params,
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
