import {Employee} from "./Data";

import {Status} from "./Common";

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
    status: Status;
    statusDate?: string;
    statusEmployee?: Employee;
    error: boolean;
    errorCode?: number;
    errorParameters?: any[];
}

export type CountingContent = {
    code: string;
    name: string;
    quantity: number;
}