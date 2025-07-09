import React, {useEffect, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {StringFormat} from "@/assets/Functions";
import {countingService} from "@/features/counting/data/counting-service";
import CountingCard from "@/features/counting/components/CountingCard";
import {ObjectAction, User} from "@/assets/Common";
import {MessageBox} from "@/components/ui/message-box";
import {toast} from "sonner";
import CountingForm from "@/features/counting/components/CountingForm";
import CountingTable from "@/features/counting/components/CountingTable";
import {Counting} from "@/features/counting/data/counting";
import {useAuth} from "@/components";

export default function CountingSupervisor() {
  const {t} = useTranslation();
  const {user} = useAuth();
  const {setLoading, setError} = useThemeContext();
  const [countings, setCountings] = useState<Counting[]>([]);
  const [selected, setSelected] = useState<Counting | null>(
    null
  );
  const [actionType, setActionType] = useState<ObjectAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    countingService.search()
      .then((data) => {
        setCountings(data);
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = (doc: Counting, action: ObjectAction) => {
    setSelected(doc);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    setLoading(true);
    setDialogOpen(false);

    const serviceCall = actionType === "cancel"
      ? countingService.cancel(selected!.id)
      : countingService.process(selected!.id);

    serviceCall
      .then((result) => {
        if (typeof result === "boolean" || result.success) {
          setCountings((prev) =>
            prev.filter((count) => count.id !== selected?.id)
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
        onNewCounting={(newCounting) => {
          const createByUser: User = {
            fullName: user!.name, id: user!.id, deleted: false,
            superUser: false,
            active: false,
            warehouses: []
          };
          newCounting = {...newCounting, createdByUser: createByUser};
          setCountings((prev) => [newCounting, ...prev]);
        }
        }
      />
      <br/>
      {/* Mobile view - Cards */}
      <div className="block sm:hidden">
        {countings.map((doc) => (
          <CountingCard supervisor={true} key={doc.id} doc={doc} handleAction={(action) => handleAction(doc, action)}/>
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
          selected?.number
        )}
        description={t('actionCannotReverse')}

      />
    </ContentTheme>
  );
}
