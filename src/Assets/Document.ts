import {MessageStripDesign} from "@ui5/webcomponents-react/dist/enums";
import {BusinessPartner, Employee} from "./Data";
import {GoodsReceiptType} from "../Pages/GoodsReceipt/Data/Document";

export type DocumentAction = "approve" | "cancel" | "qrcode";

export type Document = {
    id: number;
    name: string;
    date: string;
    employee: Employee;
    status: DocumentStatus;
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

export enum DocumentStatus {
    Open = "Open",
    Processing = "Processing",
    Finished = "Finished",
    Cancelled = "Cancelled",
    InProgress = "InProgress",
}

export enum OrderBy {
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
    purPackUn: number;
    errorMessage?: string;
}

export type AddItemResponseMultipleValue = {
    message: string;
    severity: MessageStripDesign;
};
export type DocumentStatusOption = {
    code: string;
    name: string;
    status: DocumentStatus;
};

export type ProcessResponse = {
    ok: boolean,
    errorMessage?: string;
}