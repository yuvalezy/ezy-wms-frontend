import axios from "axios";
import config from "../../config";
import {Item, User} from "../../assets/Common";
import {BusinessPartner, Employee} from "../../assets/Data";
import {TextValue} from "../../assets/TextValue";

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
    Showroom = 'Showroom'
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
        await delay(500);
        //todo remove

        const access_token = localStorage.getItem('token');
        const response = await axios.post<Document>(`${config.baseURL}/api/GoodsReceipt/Create`, {
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
        await delay(500);
        //todo remove

        const access_token = localStorage.getItem('token');
        const response = await axios.post<boolean>(`${config.baseURL}/api/GoodsReceipt/${(action === 'approve' ? 'Process' : 'Cancel')}`, {
            ID: id
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
export const fetchDocuments = async (
    id?: number,
    statuses: DocumentStatus[] = [DocumentStatus.Open, DocumentStatus.InProgress],
    orderBy: OrderBy = OrderBy.ID,
    desc: boolean = true
): Promise<Document[]> => {
    try {
        await delay(500);
        //todo remove

        const access_token = localStorage.getItem('token');

        const queryParams = [
            `OrderBy=${orderBy}`,
            `Desc=${desc}`
        ];

        if (statuses && statuses.length > 0) {
            queryParams.push(`statuses=${statuses.join(',')}`);
        }

        if (id !== null && id !== undefined) {
            queryParams.push(`ID=${id}`);
        }

        const url = `${config.baseURL}/api/GoodsReceipt/Documents?${queryParams.join('&')}`;

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
        await delay(500);
        //todo remove

        const access_token = localStorage.getItem('token');

        const url = `${config.baseURL}/api/General/ItemByBarCode?scanCode=${scanCode}`;

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

export const addItem = async(id: number, itemCode: string, barcode: string): Promise<AddItemReturnValue> => {
    try {
        await delay(500);
        //todo remove

        const access_token = localStorage.getItem('token');

        const url = `${config.baseURL}/api/GoodsReceipt/AddItem`;

        const response = await axios.post<AddItemReturnValue>(url, {
            id: id,
            itemCode: itemCode,
            barcode: barcode
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error adding item:", error);
        throw error;
    }
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));