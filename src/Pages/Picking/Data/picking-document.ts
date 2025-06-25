import {UnitType} from "@/assets";
import {ProcessResponse} from "@/assets";
import {BinLocation} from "@/assets";
import { axiosInstance } from "@/utils/axios-instance";
import {ItemDetails} from "@/pages/item-check/item-check";

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

export interface PickingDocumentDetailItem extends ItemDetails {
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
    lineId: number;
    closedDocument: boolean;
    errorMessage?: string;
}

export const fetchPicking = async (params: pickingParameters): Promise<PickingDocument> => {
    try {
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

        const url = `picking/${params.id}?${queryParams.toString()}`;

        const response = await axiosInstance.get<PickingDocument>(url);

        return response.data;
    } catch (error) {
        console.error("Error fetching pickings:", error);
        throw error;
    }
}
export const fetchPickings = async (params?: pickingsParameters): Promise<PickingDocument[]> => {
    try {
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

        const url = `Picking?${queryParams.toString()}`;

        const response = await axiosInstance.get<PickingDocument[]>(url);

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
export const addItem = async (params: {
    id: number;
    type: number;
    entry: number;
    itemCode: string;
    quantity: number;
    binEntry: number;
    unit: UnitType
}): Promise<PickingAddItemResponse> => {
    try {
        const url = `Picking/AddItem`;

        const response = await axiosInstance.post<PickingAddItemResponse>(
            url,
            params
        );
        return response.data;
    } catch (error) {
        console.error("Error adding item:", error);
        throw error;
    }
};
export const processPicking = async (
    id: number,
): Promise<ProcessResponse> => {
    try {
        const url = `Picking/Process`;

        const response = await axiosInstance.post<ProcessResponse>(
            url,
            { id: id }
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
