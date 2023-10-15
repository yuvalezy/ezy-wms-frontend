import axios from "axios";
import {Item, User} from "../../assets/Common";
import {BusinessPartner, Employee} from "../../assets/Data";
import {TextValue} from "../../assets/TextValue";
import {globalConfig} from "../../assets/GlobalConfig";
import {AlertColor} from "@mui/material";
import {StringFormat} from "../../assets/Functions";

export type Action = 'approve' | 'cancel' | 'qrcode';

export type Document = {
    id: number;
    name: string;
    date: string;
    employee: Employee;
    status: DocumentStatus;
    statusDate?: string;
    statusEmployee?: Employee;
    businessPartner?: BusinessPartner;
}


export enum DocumentStatus {
    Open = 'Open',
    Processing = 'Processing',
    Finished = 'Finished',
    Cancelled = 'Cancelled',
    InProgress = 'InProgress',
}

export enum AddItemReturnValue {
    StoreInWarehouse = 'StoreInWarehouse',
    Fulfillment = 'Fulfillment',
    Showroom = 'Showroom',
    ClosedDocument = 'ClosedDocument'
}

export type AddItemResponse = {
    message: string;
    color: AlertColor;
    value: AddItemReturnValue;
}

export const documentStatusToString = (status: DocumentStatus): string => {
    switch (status) {
        case DocumentStatus.Open:
            return TextValue.OpenStatus;
        case DocumentStatus.Processing:
            return TextValue.ProcessingStatus;
        case DocumentStatus.Finished:
            return TextValue.FinishedStatus;
        case DocumentStatus.Cancelled:
            return TextValue.CancelledStatus;
        case DocumentStatus.InProgress:
            return TextValue.InProgressStatus;
    }
};

export enum OrderBy {
    ID = 'ID',
    Name = 'Name',
    Date = 'Date',
}

export const createDocument = async (cardCode: string, name: string, user: User): Promise<Document> => {
    try {
        if (!globalConfig)
            throw new Error('Config has not been initialized!');

        if (globalConfig.debug)
            await delay(500);

        const access_token = localStorage.getItem('token');
        const response = await axios.post<Document>(`${globalConfig.baseURL}/api/GoodsReceipt/Create`, {
            CardCode: cardCode,
            Name: name
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error creating document:", error);
        throw error;  // Re-throwing so that the calling function can decide what to do with the error
    }
}
export const documentAction = async (id: number, action: Action, user: User): Promise<boolean> => {
    try {
        if (!globalConfig)
            throw new Error('Config has not been initialized!');

        if (globalConfig.debug)
            await delay(500);

        const access_token = localStorage.getItem('token');
        const response = await axios.post<boolean>(`${globalConfig.baseURL}/api/GoodsReceipt/${(action === 'approve' ? 'Process' : 'Cancel')}`, {
            ID: id
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating document: ", error);
        throw error;  // Re-throwing so that the calling function can decide what to do with the error
    }
}
export const fetchDocuments = async (
    id?: number,
    statuses: DocumentStatus[] = [DocumentStatus.Open, DocumentStatus.InProgress],
    businessPartner?: BusinessPartner | null,
    date?: Date | null,
    docName?: string,
    grpo?: number,
    orderBy: OrderBy = OrderBy.ID,
    desc: boolean = true
): Promise<Document[]> => {
    try {
        if (!globalConfig)
            throw new Error('Config has not been initialized!');

        if (globalConfig.debug)
            await delay(500);

        const access_token = localStorage.getItem('token');

        const queryParams = new URLSearchParams();
        queryParams.append('OrderBy', orderBy.toString());
        queryParams.append('Desc', desc.toString());

        if (statuses && statuses.length > 0) {
            statuses.forEach(status => queryParams.append('Status', status.toString()))
        }

        if (id !== null && id !== undefined) {
            queryParams.append('ID', id.toString());
        }

        if (grpo !== null && grpo !== undefined) {
            queryParams.append('GRPO', grpo.toString());
        }

        if (docName !== null && docName !== undefined) {
            queryParams.append('Name', docName);
        }

        if (businessPartner !== null && businessPartner !== undefined) {
            queryParams.append('BusinessPartner', businessPartner.code);
        }

        if (date !== null && date !== undefined) {
            queryParams.append('Date', date.toISOString());
        }

        const url = `${globalConfig.baseURL}/api/GoodsReceipt/Documents?${queryParams.toString()}`;

        const response = await axios.get<Document[]>(url,
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

export const scanBarcode = async (scanCode: string): Promise<Item[]> => {
    try {
        if (!globalConfig)
            throw new Error('Config has not been initialized!');

        if (globalConfig.debug)
            await delay(500);

        const access_token = localStorage.getItem('token');

        const url = `${globalConfig.baseURL}/api/General/ItemByBarCode?scanCode=${scanCode}`;

        const response = await axios.get<Item[]>(url,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

        return response.data;
    } catch (error) {
        console.error("Error canning barcode:", error);
        throw error;
    }
}

export const addItem = async (id: number, itemCode: string, barcode: string): Promise<AddItemResponse> => {
    try {
        if (!globalConfig)
            throw new Error('Config has not been initialized!');

        if (globalConfig.debug)
            await delay(500);

        const access_token = localStorage.getItem('token');

        const url = `${globalConfig.baseURL}/api/GoodsReceipt/AddItem`;

        const response = await axios.post<AddItemReturnValue>(url, {
            id: id,
            itemCode: itemCode,
            barcode: barcode
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        let message: string;
        let color: AlertColor;
        let value = response.data;
        switch (value) {
            case AddItemReturnValue.StoreInWarehouse:
                message = TextValue.ScanConfirmStoreInWarehouse;
                color = 'success';
                break;
            case AddItemReturnValue.Fulfillment:
                message = TextValue.ScanConfirmFulfillment;
                color = 'warning';
                break;
            case AddItemReturnValue.Showroom:
                message = TextValue.ScanConfirmShowroom;
                color = 'info';
                break;
            case AddItemReturnValue.ClosedDocument:
                message = StringFormat(TextValue.GoodsReceiptIsClosed, id);
                color = 'error';
                break;
            default:
                message = `Unknown return value: ${value}`;
                color = 'error';
                break;
        }

        return {
            message: message,
            color: color,
            value: value,
        };
    } catch (error) {
        console.error("Error adding item:", error);
        throw error;
    }
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));