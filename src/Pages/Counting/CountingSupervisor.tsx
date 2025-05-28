import React, {useEffect, useState} from "react";
import {useAuth} from "@/components/AppContext";
import ContentTheme from "../../components/ContentTheme";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {MessageStripDesign} from "@ui5/webcomponents-react"; // Keep for MessageStripDesign enum
import {StringFormat} from "@/Assets/Functions";
import {countingAction, fetchCountings} from "./Data/Counting";
import {Counting} from "@/Assets/Counting";
import CountingCard from "./components/CountingCard";
import {ObjectAction} from "@/Assets/Common";
import {MessageBox} from "@/components/ui/message-box";
import CountingForm from "@/Pages/Counting/Components/CountingForm";
import { toast } from "sonner";

export default function CountingSupervisor() {
  const {user} = useAuth();
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [countings, setCountings] = useState<Counting[]>([]);
  const [selectedID, setSelectedID] = useState<number | null>(
    null
  );
  const [actionType, setActionType] = useState<ObjectAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCountings()
      .then((data) => {
        setCountings(data);
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = (docId: number, action: ObjectAction) => {
    setSelectedID(docId);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    setLoading(true);
    setDialogOpen(false);
    countingAction(selectedID!, actionType!, user!)
      .then(() => {
        setCountings((prev) =>
          prev.filter((count) => count.id !== selectedID)
        );
        toast.success(actionType === "approve" ? t("approved") : t("cancelled"));
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  return (
    <ContentTheme title={t("countingSupervisor")}>
      <CountingForm
        onNewCounting={(newCounting) =>
          setCountings((prev) => [newCounting, ...prev])
        }
      />
      <br/>
      <br/>
      {countings.map((doc) => (
        <CountingCard supervisor={true} key={doc.id} doc={doc} handleAction={handleAction}/>
      ))}
      <MessageBox
        onConfirm={handleConfirmAction}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        type="confirm"
        title={StringFormat(
          actionType === "approve"
            ? t("confirmFinishDocument")
            : t("confirmCancelDocument"),
          selectedID
        )}
        description={t('actionCannotReverse')}

      />
    </ContentTheme>
  );
}
