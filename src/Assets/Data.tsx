import {useTranslation} from "react-i18next";
import {vendorsMockup} from "./mockup";

import {Status} from "./Common";
import {axiosInstance, Mockup} from "@/utils/axios-instance";

export type Employee = {
  id: number;
  name: string;
};

export type BusinessPartner = {
  code: string;
  name: string;
};


export function useDocumentStatusOptions() {
  const { t } = useTranslation();

  return [
    {code: "Open", name: t("openStatus"), status: Status.Open},
    {
      code: "Processing",
      name: t("processingStatus"),
      status: Status.Processing,
    },
    {
      code: "Finished",
      name: t("finishedStatus"),
      status: Status.Finished,
    },
    {
      code: "Cancelled",
      name: t("cancelledStatus"),
      status: Status.Cancelled,
    },
    {
      code: "InProgress",
      name: t("inProgressStatus"),
      status: Status.InProgress,
    },
  ];
}

export const fetchVendors = async (): Promise<BusinessPartner[]> => {
  try {
    if (Mockup)
      return vendorsMockup;

    const response = await axiosInstance.get<BusinessPartner[]>(
      `General/Vendors`,

    );
    return response.data;
  } catch (error) {
    console.error("Error loading vendors:", error);
    throw error; // Re-throwing so that the calling function can decide what to do with the error
  }
};
