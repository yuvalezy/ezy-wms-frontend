import {useTranslation} from "react-i18next";
import {Status} from "@/features/shared/data";

export function useDocumentStatusOptions() {
  const {t} = useTranslation();

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