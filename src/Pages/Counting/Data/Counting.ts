import {configUtils, delay, globalConfig} from "../../../Assets/GlobalConfig";
import {countingMockup, documentMockup} from "../../../Assets/mockup";
import {DocumentAction, DocumentStatus} from "../../../Assets/Document";
import axios from "axios";
import {Counting, CountingContent, OrderBy} from "../../../Assets/Counting";
import {User} from "../../../Assets/Common";

export const createCounting = async (
    name: string
): Promise<Counting> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return countingMockup;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();
        const access_token = localStorage.getItem("token");
        const response = await axios.post<Counting>(
            `${globalConfig.baseURL}/api/Counting/Create`,
            {
                name: name,
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error creating counting:", error);
        throw error; // Re-throwing so that the calling function can decide what to do with the error
    }
}
export const countingAction = async (
    id: number,
    action: DocumentAction,
    user: User
): Promise<boolean> => {
    try {
        if (configUtils.isMockup) {
            if (action === "approve") {
                documentMockup.status = DocumentStatus.Finished;
                return true;
            }
            console.log("Mockup data is being used.");
            return true;
        }

        if (!globalConfig) throw new Error("Config has not been initialized!");

        if (globalConfig.debug) await delay();

        const access_token = localStorage.getItem("token");
        const response = await axios.post<boolean>(
            `${globalConfig.baseURL}/api/Counting/${
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
        console.error("Error creating counting: ", error);
        throw error; // Re-throwing so that the calling function can decide what to do with the error
    }
};
export const fetchCountings = async (
    id?: number,
    statuses: DocumentStatus[] = [DocumentStatus.Open, DocumentStatus.InProgress],
    date?: Date | null,
    docName?: string,
    orderBy: OrderBy = OrderBy.ID,
    desc: boolean = true
): Promise<Counting[]> => {
    try {
        if (configUtils.isMockup) {
            console.log("Mockup data is being used.");
            return [countingMockup];
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

        if (docName !== null && docName !== undefined) {
            queryParams.append("Name", docName);
        }

        if (date !== null && date !== undefined) {
            queryParams.append("Date", date.toISOString());
        }

        const url = `${
            globalConfig.baseURL
        }/api/Counting/Countings?${queryParams.toString()}`;

        const response = await axios.get<Counting[]>(url, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching countings:", error);
        throw error;
    }
};

export const fetchCountingContent = async (id: number, binEntry?: number): Promise<CountingContent[]> => {
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

        const url = `${globalConfig.baseURL}/api/Counting/CountingContent`;

        const response = await axios.post<CountingContent[]>(
            url,
            {
                id: id,
                binEntry: binEntry
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching countings:", error);
        throw error;
    }
}