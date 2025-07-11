import {useTranslation} from "react-i18next";
import {useAuth} from "@/components/AppContext";
import {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import {useThemeContext} from "@/components/ThemeContext";
import { toast } from "sonner";
import {ObjectAction, Status} from "@/features/shared/data/shared";
import {DocumentListDialogRef} from "@/features/goods-receipt/components/DocumentListDialog";
import {ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {goodsReceiptService} from "@/features/goods-receipt/data/goods-receipt-service";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";

export const useGoodsReceiptSupervisorData = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [supervisor, setSupervisor] = useState(false);
  const {setLoading, setError} = useThemeContext();
  const [documents, setDocuments] = useState<ReceiptDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ReceiptDocument | null>(null);
  const [actionType, setActionType] = useState<ObjectAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const location = useLocation();
  const confirmation = location.pathname.includes('goodsReceiptConfirmationSupervisor');

  useEffect(() => {
    if (!confirmation) {
      setSupervisor(user?.roles.filter((v) => v === RoleType.GOODS_RECEIPT_SUPERVISOR).length === 1);
    } else {
      setSupervisor(user?.roles.filter((v) => v === RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR).length === 1);
    }
    setLoading(true);
    goodsReceiptService.search({statuses: [Status.Open, Status.InProgress], confirm: confirmation})
      .then((data) => setDocuments(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  function handleDocDetails(doc: ReceiptDocument) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  const handleAction = (doc: ReceiptDocument, action: ObjectAction) => {
    setSelectedDocument(doc);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    setLoading(true);
    setDialogOpen(false);
    const serviceCall = actionType === 'approve' ?
      goodsReceiptService.process(selectedDocument!.id) :
      goodsReceiptService.cancel(selectedDocument!.id);

    serviceCall
      .then((response) => {
        if (typeof response === "boolean" || response.success) {
          setDocuments((prevDocs) =>
            prevDocs.filter((doc) => doc.id !== selectedDocument?.id)
          );
          toast.success(actionType === "approve" ? t("approved") : t("cancelled"));
        } else {
          toast.error(response.errorMessage);
        }
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  function getTitle(): string {
    if (!confirmation) {
      let title = t("goodsReceiptSupervisor");
      if (!user?.settings?.goodsReceiptCreateSupervisorRequired) {
        if (!supervisor) {
          title = t("goodsReceiptCreation");
        }
      }
      return title;
    } else {
      let title = t("goodsReceiptConfirmationSupervisor");
      if (!user?.settings?.goodsReceiptCreateSupervisorRequired) {
        if (!supervisor) {
          title = t("goodsReceiptConfirmationCreation");
        }
      }
      return title;
    }
  }

  return {
    supervisor,
    documents,
    selectedDocument,
    setDocuments,
    actionType,
    dialogOpen,
    documentListDialogRef,
    handleDocDetails,
    handleAction,
    handleConfirmAction,
    setDialogOpen,
    getTitle,
    confirmation
  }
}
