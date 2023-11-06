import axios from "axios";
import {DocumentStatus} from "../Pages/GoodsReceiptSupervisor/Document";
import {getMockupConfig, globalConfig} from "./GlobalConfig";
import {useTranslation} from "react-i18next";
import {vendorsMockup} from "./mockup";

export type Employee = {
  id: number;
  name: string;
};

export type BusinessPartner = {
  code: string;
  name: string;
};

export type DocumentStatusOption = {
  code: string;
  name: string;
  status: DocumentStatus;
};

export function useDocumentStatusOptions() {
  const { t } = useTranslation();

  return [
    {code: "Open", name: t("openStatus"), status: DocumentStatus.Open},
    {
      code: "Processing",
      name: t("processingStatus"),
      status: DocumentStatus.Processing,
    },
    {
      code: "Finished",
      name: t("finishedStatus"),
      status: DocumentStatus.Finished,
    },
    {
      code: "Cancelled",
      name: t("cancelledStatus"),
      status: DocumentStatus.Cancelled,
    },
    {
      code: "InProgress",
      name: t("inProgressStatus"),
      status: DocumentStatus.InProgress,
    },
  ];
}

const isMockup = getMockupConfig();

export const fetchVendors = async (): Promise<BusinessPartner[]> => {
  try {
    if (!globalConfig)
      throw new Error("Config has not been initialized!");

    if (isMockup)
      return vendorsMockup;

    const access_token = localStorage.getItem("token");
    const response = await axios.get<BusinessPartner[]>(
      `${globalConfig.baseURL}/api/General/Vendors`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error loading vendors:", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
  }
};
