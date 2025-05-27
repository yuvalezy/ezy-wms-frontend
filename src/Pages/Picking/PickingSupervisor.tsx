import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {fetchPickings, PickingDocument, processPicking} from "./Data/PickingDocument";
import {useThemeContext} from "@/components/ThemeContext";
import {MessageStrip} from "@ui5/webcomponents-react"; // Keep for MessageStripDesign enum
import {StringFormat} from "@/Assets/Functions";
import PickingCard from "@/Pages/Picking/Components/PickingCard";
import {StatusAlertType} from "@/components/ThemeProviderStatusAlert";

export default function PickingSupervisor() {
  const {t} = useTranslation();
  const [pickings, setPickings] = useState<PickingDocument[]>([]);
  const {setLoading, setAlert, setError} = useThemeContext();
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
        setAlert({message: StringFormat(t("pickingUpdateSuccess"), picking.entry), type: StatusAlertType.Positive})
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
          <div style={{padding: '10px'}}>
              <MessageStrip hideCloseButton design={StatusAlertType.Information}>
                {t("nodata")}
              </MessageStrip>
          </div>
      }
    </ContentTheme>
  );
}
