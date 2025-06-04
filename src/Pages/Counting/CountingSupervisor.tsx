import React, {useEffect, useState} from "react";
import {useAuth} from "@/components/AppContext";
import ContentTheme from "../../components/ContentTheme";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {StringFormat} from "@/assets/Functions";
import {countingAction, fetchCountings} from "@/pages/Counting/data/Counting";
import {Counting} from "@/assets/Counting";
import CountingCard from "@/pages/Counting/components/CountingCard";
import {ObjectAction, Status} from "@/assets/Common";
import {MessageBox} from "@/components/ui/message-box";
import { toast } from "sonner";
import CountingForm from "@/pages/Counting/components/CountingForm";
import CountingTable from "@/pages/Counting/components/CountingTable";
import {useNavigate} from "react-router-dom";
import {RoleType} from "@/assets/RoleType";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {useDateTimeFormat} from "@/assets/DateFormat";

export default function CountingSupervisor() {
  const {user} = useAuth();
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [countings, setCountings] = useState<Counting[]>([]);
  const [selectedID, setSelectedID] = useState<string | null>(
    null
  );
  const [actionType, setActionType] = useState<ObjectAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();
  
  function handleOpen(id: number) {
    navigate(`/counting/${id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.COUNTING);

  useEffect(() => {
    setLoading(true);
    fetchCountings()
      .then((data) => {
        setCountings(data);
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = (docId: string, action: ObjectAction) => {
    setSelectedID(docId);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    setLoading(true);
    setDialogOpen(false);
    countingAction(selectedID!, actionType!, user!)
      .then((result) => {
        if (typeof result === "boolean" || result.success) {
          setCountings((prev) =>
            prev.filter((count) => count.id !== selectedID)
          );
          toast.success(actionType === "approve" ? t("approved") : t("cancelled"));
        }
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
      {/* Mobile view - Cards */}
      <div className="block sm:hidden">
        {countings.map((doc) => (
          <CountingCard supervisor={true} key={doc.id} doc={doc} handleAction={handleAction}/>
        ))}
      </div>
      
      {/* Desktop view - Table */}
      <div className="hidden sm:block">
        <CountingTable 
          countings={countings} 
          supervisor={true} 
          onAction={handleAction} 
        />
      </div>
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
