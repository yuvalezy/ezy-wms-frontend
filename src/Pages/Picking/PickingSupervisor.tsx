import ContentTheme from "@/components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {fetchPickings, PickingDocument, processPicking} from "@/pages/Picking/data/PickingDocument";
import {useThemeContext} from "@/components/ThemeContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {StringFormat} from "@/assets/Functions";
import { toast } from "sonner";
import PickingCard from "@/pages/Picking/components/PickingCard";

export default function PickingSupervisor() {
  const {t} = useTranslation();
  const [pickings, setPickings] = useState<PickingDocument[]>([]);
  const {setLoading, setError} = useThemeContext();
  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    fetchPickings()
      .then(values => setPickings(values))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }

  function handleUpdatePick(picking: PickingDocument) {
    if (picking.openQuantity > 0 && !window.confirm(StringFormat(t('pickOpenQuantityAlert'), picking.entry) + '\n' + t('confirmContinue'))) {
      return;
    }
    setLoading(true);
    processPicking(picking.entry)
      .then(() => {
        toast.success(StringFormat(t("pickingUpdateSuccess"), picking.entry));
        loadData();
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }

  return (
    <ContentTheme title={t("pickSupervisor")}>
      {pickings.map((pick) => (
        <PickingCard key={pick.entry} picking={pick} supervisor={true}
                     onUpdatePick={handleUpdatePick}/>
      ))}
      {pickings.length === 0 &&
          <div className="p-4">
              <Alert variant="default" className="bg-blue-100 border-blue-400 text-blue-700">
                {/* <AlertTitle>Information</AlertTitle> */}
                <AlertDescription>{t("nodata")}</AlertDescription>
              </Alert>
          </div>
      }
    </ContentTheme>
  );
}
