import axios from "axios";
import config from "../../config";
import {User} from "../../assets/Common";

export type Action = 'approve' | 'cancel' | 'qrcode';

export type Document = {
    id: number;
    name: string;
    date: string;
    employee: Employee;
    status: DocumentStatus;
    statusDate?: string;
    statusEmployee?: Employee;
}

export type Employee = {
    id: number;
    name: string;
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

export const createDocument = async (name: string, user: User): Promise<Document> => {
    try {
        const access_token = localStorage.getItem('token');
        const response = await axios.post<number>(`${config.baseURL}/api/GoodsReceipt/Create`, {
            Name: name
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        const now = new Date().toISOString().split('T')[0];

        return {
            id: response.data,
            name: name,
            date: now,
            employee: {
                id: user!.id,
                name: user!.name,
            },
            status: DocumentStatus.Open
        };
    } catch (error) {
        console.error("Error creating document:", error);
        throw error;  // Re-throwing so that the calling function can decide what to do with the error
    }
}
export const documentAction = async (id: number, action: Action, user: User): Promise<boolean> => {
    try {
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
    id? :number,
    statuses: DocumentStatus[] = [DocumentStatus.Open, DocumentStatus.InProgress],
    orderBy: OrderBy = OrderBy.ID,
    desc: boolean = true
): Promise<Document[]> => {
    try {
        const access_token = localStorage.getItem('token');
        const statusesString = statuses.join(',');
        const url = `${config.baseURL}/api/GoodsReceipt/Documents?statuses=${statusesString}&ID=${id}&OrderBy=${orderBy}&Desc=${desc}`;
        const response = await axios.get<Document[]>(url,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });

        return response.data.map((v: any) => ({
            id: v.ID,
            name: v.Name,
            date: v.Date,
            employee: {
                id: v.Employee.ID,
                name: v.Employee.Name
            },
            status: v.Status,
            statusDate: v.StatusDate,
            statusEmployee: {
                id: v.StatusEmployee?.ID,
                name: v.StatusEmployee?.Name
            }
        }));
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
    }
};