import axios from "axios";
import { DocumentStatus } from "../Pages/GoodsReceiptSupervisor/Document";
import {globalConfig} from "./GlobalConfig";
import {useTranslation} from "react-i18next";

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

export function useDocumentStatusOptions() {
    const { t} = useTranslation();

    const DocumentStatusOptions = [
        { code: 'Open', name: t('OpenStatus'), status: DocumentStatus.Open },
        { code: 'Processing', name: t('ProcessingStatus'), status: DocumentStatus.Processing },
        { code: 'Finished', name: t('FinishedStatus'), status: DocumentStatus.Finished },
        { code: 'Cancelled', name: t('CancelledStatus'), status: DocumentStatus.Cancelled },
        { code: 'InProgress', name: t('InProgressStatus'), status: DocumentStatus.InProgress },
    ];

    return DocumentStatusOptions;
}

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
