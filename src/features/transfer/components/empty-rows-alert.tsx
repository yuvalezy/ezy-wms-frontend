import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertCircle} from "lucide-react";
import {useTranslation} from "react-i18next";

export const EmptyRowsAlert = () => {
  const {t} = useTranslation();

  return (
    <Alert variant="information">
      <AlertCircle className="h-4 w-4"/>
      <AlertDescription>{t("nodata")}</AlertDescription>
    </Alert>
  );
};
