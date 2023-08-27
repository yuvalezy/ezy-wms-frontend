import axios from "axios";
import config from "../../config";
import {User} from "../../assets/Common";
import {BusinessPartner, Employee} from "../../assets/Data";

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

export enum OrderBy {
    ID = 'ID',
    Name = 'Name',
    Date = 'Date',
}

export const createDocument = async (cardCode: string, name: string, user: User): Promise<Document> => {
    try {
        await delay(2000);
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
        await delay(2000);
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
        await delay(2000);
        //todo remove

        const access_token = localStorage.getItem('token');
        const statusesString = statuses.join(',');
        const url = `${config.baseURL}/api/GoodsReceipt/Documents?statuses=${statusesString}&ID=${id}&OrderBy=${orderBy}&Desc=${desc}`;
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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));