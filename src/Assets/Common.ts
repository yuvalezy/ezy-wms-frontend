import {RoleType} from "./RoleType";
import {AlertSeverity} from "@/components";

export interface AxiosErrorResponse {
    exceptionMessage: string;
    exceptionType: string;
    message: string;
}
export interface User {
    id: string;
    name: string;
    roles: RoleType[];
    warehouses: Warehouse[];
    currentWarehouse: string;
    binLocations: boolean;
    settings: ApplicationSettings;
    superUser: boolean;
}

export interface Warehouse {
    id: string;
    name: string;
    enableBinLocations: boolean;
}

export interface ApplicationSettings {
    goodsReceiptDraft: boolean;
    goodsReceiptModificationSupervisor: boolean;
    goodsReceiptCreateSupervisorRequired: boolean;
    transferTargetItems: boolean;
}

export type Item = {
    code: string;
    name: string;
    father: string;
    boxNumber?: number;
    barcode?: string;
}

export type BinLocation = {
    entry: number;
    code: string;
    quantity: number;
}

export enum ResponseStatus {
    Error = 'Error',
    Ok = 'Ok'
}

export function distinctItems(items: Item[]): string[] {
    return items
        .map(item => item.father ?? item.code)
        .filter((code, index, array) => array.indexOf(code) === index);
}

export interface UpdateLineParameters {
    id: number;
    lineID: number;
    comment?: string;
    userName?: string;
    quantity?: number;
    reason?: number;
}

export enum UpdateLineReturnValue {
    Status = "Status",
    LineStatus = "LineStatus",
    CloseReason = "CloseReason",
    Ok = "Ok",
    SupervisorPassword = "SupervisorPassword",
    NotSupervisor = "NotSupervisor",
    QuantityMoreThenAvailable = "QuantityMoreThenAvailable",
}

export enum Status {
    Open = "Open",
    Processing = "Processing",
    Finished = "Finished",
    Cancelled = "Cancelled",
    InProgress = "InProgress",
}

export type AddItemResponseMultipleValue = {
    message: string;
    severity: AlertSeverity;
};
export type ObjectAction = "approve" | "cancel";

export enum SourceTarget {
    Source = "Source",
    Target = "Target"
}

export type DetailUpdateParameters = {
    id: number;
    removeRows: number[];
    quantityChanges: { [key: number]: number }
};

export enum UnitType {
    Unit = 'Unit',
    Dozen = 'Dozen',
    Pack = 'Pack'
}