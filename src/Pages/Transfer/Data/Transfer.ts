import {BusinessPartner, Employee} from "../../../Assets/Data";
import {configUtils, delay, globalConfig} from "../../../Assets/GlobalConfig";
import {documentMockup, transferMockup} from "../../../Assets/mockup";
import axios from "axios";
import {Document, DocumentOrderBy} from "../../../Assets/Document";
import {Status} from "../../../Assets/Common";

export type Transfer = {
    id: number;
    date: string;
    employee: Employee;
    status: Status;
    statusDate: string;
    statusEmployee: Employee;
}

export type TransferBinContent = {
    code: string;
    name: string;
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
