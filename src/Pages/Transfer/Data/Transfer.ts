import {Employee} from "../../../Assets/Data";
import {configUtils, delay, globalConfig} from "../../../Assets/GlobalConfig";
import {GoodsReceiptAllDetailMockup, transferMockup} from "../../../Assets/mockup";
import axios from "axios";
import {DetailUpdateParameters, ObjectAction, SourceTarget, Status} from "../../../Assets/Common";

interface TransferAddItemResponse {
    lineID?: number
    closedTransfer: boolean;
    errorMessage?: string;
}

export type Transfer = {
    id: number;
    name?: string;
    date: string;
    employee: Employee;
    status: Status;
    statusDate: string;
    statusEmployee: Employee;
    progress?: number;
    comments?: string;
}

export type TransferContent = {
    code: string;
    name: string;
    quantity: number;
    openQuantity: number;
    binQuantity?: number;
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

export const createTransfer = async (
    name: string,
    comments: string,
): Promise<Transfer> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return transferMockup;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");
        const response = await axios.post<Transfer>(
            `${globalConfig.baseURL}/api/Transfer/Create`, {name, comments},
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

export type TransferUpdateParameters = {
    id?: number,
    statuses?: Status[];
    date?: Date | null,
    number?: number,
    orderBy?: TransfersOrderBy;
    desc?: boolean;
    progress?: boolean
}
export const fetchTransfers = async (params: TransferUpdateParameters): Promise<Transfer[]> => {
    if (params.statuses == null)
        params.statuses = params.id == null ? [Status.Open, Status.InProgress] : [];
    if (params.orderBy == null)
        params.orderBy = TransfersOrderBy.ID;
    if (params.desc == null)
        params.desc = true;
    if (params.progress == null)
        params.progress = false;

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
        queryParams.append("OrderBy", params.orderBy.toString());
        queryParams.append("Desc", params.desc.toString());

        params.statuses.forEach((status) =>
            queryParams.append("Status", status.toString())
        );

        if (params.id !== null && params.id !== undefined) {
            queryParams.append("ID", params.id.toString());
        }

        if (params.number !== null && params.number !== undefined) {
            queryParams.append("Number", params.number.toString());
        }

        if (params.date !== null && params.date !== undefined) {
            queryParams.append("Date", params.date.toISOString());
        }

        if (params.progress !== null && params.progress !== undefined) {
            queryParams.append("Progress", params.progress.toString());
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
    id: number
    type: SourceTarget
    binEntry?: number
    targetBins?: boolean
    itemCode?: string
    targetBinQuantity?: boolean
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
export type TargetItemDetail = {
    lineID: number;
    employeeName: string;
    timeStamp: Date;
    quantity: number;
};
export const fetchTargetItemDetails = async (id: number, item: string, binEntry: number): Promise<TargetItemDetail[]> => {
    try {
        if (!globalConfig)
            throw new Error("Config has not been initialized!");
        if (globalConfig.debug)
            await delay();
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return GoodsReceiptAllDetailMockup;
        }

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/Transfer/TransferContentTargetDetail`;

        const response = await axios.post<any[]>(url, {
            id: id,
            itemCode: item,
            binEntry: binEntry
        }, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const details: TargetItemDetail[] = response.data.map((item: any) => ({
            lineID: item.lineID,
            employeeName: item.employeeName,
            timeStamp: new Date(item.timeStamp),
            quantity: item.quantity
        }));

        return details;
    } catch (error) {
        console.error("Error fetching all details:", error);
        throw error;
    }
};
export const updateTransferTargetItem = async (data: DetailUpdateParameters) => {
    try {
        if (configUtils.isMockup) {
            return;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");

        const url = `${globalConfig.baseURL}/api/Transfer/UpdateContentTargetDetail`;

        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error updating goods receipt:", error);
        throw error;
    }
}
export const transferAction = async (
    id: number,
    action: ObjectAction,
): Promise<boolean> => {
    try {
        if (configUtils.isMockup) {
            if (action === "approve") {
                //todo
                return true;
            }
            console.log("Mockup data is being used.");
            return true;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");
        const response = await axios.post<boolean>(
            `${globalConfig.baseURL}/api/Transfer/${
                action === "approve" ? "Process" : "Cancel"
            }`,
            {
                ID: id,
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating transfer: ", error);
        throw error; // Re-throwing so that the calling function can decide what to do with the error
    }
};
