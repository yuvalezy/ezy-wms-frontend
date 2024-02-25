import {Employee} from "../../../Assets/Data";
import {configUtils, delay, globalConfig} from "../../../Assets/GlobalConfig";
import {transferMockup} from "../../../Assets/mockup";
import axios from "axios";
import {SourceTarget, Status} from "../../../Assets/Common";

interface TransferAddItemResponse {
    lineID?: number
    closedTransfer: boolean;
    errorMessage?: string;
}

export type Transfer = {
    id: number;
    date: string;
    employee: Employee;
    status: Status;
    statusDate: string;
    statusEmployee: Employee;
}

export type TransferContent = {
    code: string;
    name: string;
    quantity: number;
    openQuantity: number;
    progress?: number;
    bins?: TransferContentBin[];
}
export type TransferContentBin = {
    entry: number;
    code: string;
    quantity: number;
}

export enum TransfersOrderBy {
    ID = "ID",
    Date = "Date",
}

export const createTransfer = async (): Promise<Transfer> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return transferMockup;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");
        const response = await axios.post<Transfer>(
            `${globalConfig.baseURL}/api/Transfer/Create`, {},
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error creating transfer:", error);
        throw error;
    }
};
export const checkIsComplete = async (id: number): Promise<boolean> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return true;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");
        const response = await axios.get<boolean>(
            `${globalConfig.baseURL}/api/Transfer/IsComplete/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error creating transfer:", error);
        throw error; // Re-throwing so that the calling function can decide what to do with the error
    }
};
export const fetchTransfers = async (
    id?: number,
    statuses: Status[] = [Status.Open, Status.InProgress],
    date?: Date | null,
    number?: number,
    orderBy: TransfersOrderBy = TransfersOrderBy.ID,
    desc: boolean = true
): Promise<Transfer[]> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return [transferMockup];
        }

        if (!globalConfig)
            throw new Error("Config has not been initialized!");

        if (globalConfig.debug)
            await delay();

        const access_token = localStorage.getItem("token");

        const queryParams = new URLSearchParams();
        queryParams.append("OrderBy", orderBy.toString());
        queryParams.append("Desc", desc.toString());

        if (statuses && statuses.length > 0) {
            statuses.forEach((status) =>
                queryParams.append("Status", status.toString())
            );
        }

        if (id !== null && id !== undefined) {
            queryParams.append("ID", id.toString());
        }

        if (number !== null && number !== undefined) {
            queryParams.append("Number", number.toString());
        }

        if (date !== null && date !== undefined) {
            queryParams.append("Date", date.toISOString());
        }

        const url = `${
            globalConfig.baseURL
        }/api/Transfer/Transfers?${queryParams.toString()}`;

        const response = await axios.get<Transfer[]>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching transfers:", error);
        throw error;
    }
};

export type addItemParameters = {
    id: number,
    itemCode: string,
    barcode?: string,
    type: SourceTarget,
    binEntry?: number,
    quantity?: number,
}

export const addItem = async (params: addItemParameters): Promise<TransferAddItemResponse> => {
    try {
        params.quantity ??= 1;
        if (configUtils.isMockup) {
            //todo mockup
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/Transfer/AddItem`;

        const response = await axios.post<TransferAddItemResponse>(
            url,
            params,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );
        if (response.data.errorMessage == null) {
            return response.data;
        } else {
            throw new Error(response.data.errorMessage);
        }
    } catch (error) {
        console.error("Error adding item:", error);
        throw error;
    }
}

export type transferContentParameters = {
    id: number;
    type: SourceTarget;
    binEntry?: number;
    targetBins?: boolean,
    itemCode?: string
}
export const fetchTransferContent = async (params: transferContentParameters): Promise<TransferContent[]> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            //todo return mockup
        }

        if (!globalConfig)
            throw new Error("Config has not been initialized!");

        if (globalConfig.debug)
            await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/Transfer/TransferContent`;

        const response = await axios.post<TransferContent[]>(
            url,
            params,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching transfer content:", error);
        throw error;
    }
}
