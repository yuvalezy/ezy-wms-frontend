import {useTranslation} from "react-i18next";
import {useAuth} from "@/components/AppContext";
import {useEffect, useRef, useState} from "react";
import {useThemeContext} from "@/components/ThemeContext";
import { toast } from "sonner";
import {Document} from "@/assets/Document";
import {ObjectAction, Status} from "@/assets/Common";
import {DocumentListDialogRef} from "@/pages/GoodsReceipt/components/DocumentListDialog";
import {Authorization} from "@/assets/Authorization";
import {documentAction, fetchDocuments} from "@/pages/GoodsReceipt/data/Document";
import {globalSettings} from "@/assets/GlobalConfig";

export const useGoodsReceiptSupervisorData = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [supervisor, setSupervisor] = useState(false);
  const {setLoading, setError} = useThemeContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [actionType, setActionType] = useState<ObjectAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);

  useEffect(() => {
    setSupervisor(user?.authorizations.filter((v) => v === Authorization.GOODS_RECEIPT_SUPERVISOR).length === 1);
    setLoading(true);
    fetchDocuments({status: [Status.Open, Status.InProgress]})
      .then((data) => setDocuments(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  function handleDocDetails(doc: Document) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  const handleAction = (docId: number, action: ObjectAction) => {
    setSelectedDocumentId(docId);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    setLoading(true);
    setDialogOpen(false);
    documentAction(selectedDocumentId!, actionType!, user!)
      .then(() => {
        setDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc.id !== selectedDocumentId)
        );
        toast.success(actionType === "approve" ? t("approved") : t("cancelled"));
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  function getTitle(): string {
    let title = t("goodsReceiptSupervisor");
    if (!globalSettings?.grpoCreateSupervisorRequired) {
      if (!supervisor) {
        title = t("goodsReceiptCreation");
      }
    }
    return title;
  }

  return {
    supervisor,
    documents,
    selectedDocument,
    setDocuments,
    selectedDocumentId,
    actionType,
    dialogOpen,
    documentListDialogRef,
    handleDocDetails,
    handleAction,
    handleConfirmAction,
    setDialogOpen,
    getTitle
  }
}
