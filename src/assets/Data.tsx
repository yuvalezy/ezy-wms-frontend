import axios from "axios";
import { DocumentStatus } from "../Pages/GoodsReceiptSupervisor/Document";
import {globalConfig} from "./GlobalConfig";
import {TextValue} from "./TextValue";

export type Employee = {
    id: number;
    name: string;
}

export type BusinessPartner = {
    code: string;
    name: string;
}

export type DocumentStatusOption = {
    code: string;
    name: string;
    status: DocumentStatus;
};

export const DocumentStatusOptions: DocumentStatusOption[] = [
    { code: 'Open', name: TextValue.OpenStatus, status: DocumentStatus.Open },
    { code: 'Processing', name: TextValue.ProcessingStatus, status: DocumentStatus.Processing },
    { code: 'Finished', name: TextValue.FinishedStatus, status: DocumentStatus.Finished },
    { code: 'Cancelled', name: TextValue.CancelledStatus, status: DocumentStatus.Cancelled},
    { code: 'InProgress', name: TextValue.InProgressStatus, status: DocumentStatus.InProgress },
];

export const fetchVendors = async (): Promise<BusinessPartner[]> => {
    try {
        if (!globalConfig)
            throw new Error('Config has not been initialized!');

        const access_token = localStorage.getItem('token');
        const response = await axios.get<BusinessPartner[]>(`${globalConfig.baseURL}/api/General/Vendors`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error loading vendors:", error);
        throw error;  // Re-throwing so that the calling function can decide what to do with the error
    }
}
