import {Employee} from "./Data";
import {DocumentStatus} from "./Document";

export enum OrderBy {
    ID = "ID",
    Name = "Name",
    Date = "Date",
}

export type Counting = {
    id: number;
    name: string;
    date: string;
    employee: Employee;
    status: DocumentStatus;
    statusDate?: string;
    statusEmployee?: Employee;
    error: boolean;
    errorCode?: number;
    errorParameters?: any[];
}

