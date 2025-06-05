import {useTranslation} from "react-i18next";
import {useAuth} from "@/components/AppContext";
import {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import {useThemeContext} from "@/components/ThemeContext";
import { toast } from "sonner";
import {Document} from "@/assets/Document";
import {ObjectAction, Status} from "@/assets/Common";
import {DocumentListDialogRef} from "@/pages/GoodsReceipt/components/DocumentListDialog";
import {RoleType} from "@/assets/RoleType";
import {documentAction, fetchDocuments} from "@/pages/GoodsReceipt/data/Document";

export const useGoodsReceiptSupervisorData = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [supervisor, setSupervisor] = useState(false);
  const {setLoading, setError} = useThemeContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
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
    fetchDocuments({status: [Status.Open, Status.InProgress], confirm: confirmation})
      .then((data) => setDocuments(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  function handleDocDetails(doc: Document) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  const handleAction = (doc: Document, action: ObjectAction) => {
    setSelectedDocument(doc);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    setLoading(true);
    setDialogOpen(false);
    documentAction(selectedDocument!.id, actionType!, user!)
      .then(() => {
        setDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc.id !== selectedDocument?.id)
        );
        toast.success(actionType === "approve" ? t("approved") : t("cancelled"));
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
