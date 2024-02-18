import {BusinessPartner, Employee} from "./Data";
import {GoodsReceiptType} from "../Pages/GoodsReceipt/Data/Document";
import {Status} from "./Common";

export type Document = {
    id: number;
    name: string;
    date: string;
    employee: Employee;
    status: Status;
    statusDate?: string;
    statusEmployee?: Employee;
    businessPartner?: BusinessPartner;
    type: GoodsReceiptType;
    error: boolean;
    errorCode?: number;
    errorParameters?: any[];
    specificDocuments?: DocumentItem[];
};

export type DocumentItem = {
    objectType: number;
    documentNumber: number;
};

export enum DocumentOrderBy {
    ID = "ID",
    Name = "Name",
    Date = "Date",
}
export interface DocumentAddItemResponse {
    lineID: number;
    closedDocument: boolean;
    fulfillment: boolean;
    showroom: boolean;
    warehouse: boolean;
    quantity: number;
    errorMessage?: string;
}

export type DocumentStatusOption = {
    code: string;
    name: string;
    status: Status;
};

export type ProcessResponse = {
    ok: boolean,
    errorMessage?: string;
}