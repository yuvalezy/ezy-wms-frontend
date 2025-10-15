import {useTranslation} from "react-i18next";
import {useAuth} from "@/components/AppContext";
import {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router";
import {useThemeContext} from "@/components/ThemeContext";
import {toast} from "sonner";
import {Status} from "@/features/shared/data/shared";
import {DocumentListDialogRef} from "@/features/goods-receipt/components/DocumentListDialog";
import {ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {goodsReceiptService} from "@/features/goods-receipt/data/goods-receipt-service";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {ProcessType} from "@/features/shared/data";
import {ObjectAction} from "@/features/packages/types";

export const useGoodsReceiptSupervisorData = (processType: ProcessType = ProcessType.Regular) => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [supervisor, setSupervisor] = useState(false);
  const {setError} = useThemeContext();
  const [documents, setDocuments] = useState<ReceiptDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ReceiptDocument | null>(null);
  const [actionType, setActionType] = useState<ObjectAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const location = useLocation();

  useEffect(() => {
    if (processType === ProcessType.Regular) {
      setSupervisor(user?.roles.filter((v) => v === RoleType.GOODS_RECEIPT_SUPERVISOR).length === 1);
    } else if (processType === ProcessType.Confirmation) {
      setSupervisor(user?.roles.filter((v) => v === RoleType.GOODS_RECEIPT_CONFIRMATION_SUPERVISOR).length === 1);
    } else if (processType === ProcessType.TransferConfirmation) {
      setSupervisor(user?.roles.filter((v) => v === RoleType.TRANSFER_SUPERVISOR).length === 1);
    }
    
    setIsLoading(true);
    goodsReceiptService.search({statuses: [Status.Open, Status.InProgress], processType})
      .then((data) => setDocuments(data))
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [processType, user]);

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
    setDialogOpen(false);
    setIsProcessing(true);
    const serviceCall = actionType === 'process' ?
      goodsReceiptService.process(selectedDocument!.id) :
      goodsReceiptService.cancel(selectedDocument!.id);

    serviceCall
      .then((response) => {
        if (typeof response === "boolean" || response.success) {
          setDocuments((prevDocs) =>
            prevDocs.filter((doc) => doc.id !== selectedDocument?.id)
          );
          toast.success(actionType === "process" ? t("approved") : t("cancelled"));
        } else {
          toast.error(response.errorMessage);
        }
      })
      .catch((error) => setError(error))
      .finally(() => setIsProcessing(false));
  };

  function getTitle(): string {
    let title: string;
    let creationTitle: string;

    switch (processType) {
      case ProcessType.Confirmation:
        title = t("goodsReceiptConfirmationSupervisor");
        creationTitle = t("goodsReceiptConfirmationCreation");
        break;
      case ProcessType.TransferConfirmation:
        title = t("transferConfirmationSupervisor");
        creationTitle = t("transferConfirmationCreation");
        break;
      default:
        title = t("goodsReceiptSupervisor");
        creationTitle = t("goodsReceiptCreation");
    }

    if (!user?.settings?.goodsReceiptCreateSupervisorRequired && !supervisor) {
      return creationTitle;
    }

    return title;
  }

  return {
    supervisor,
    documents,
    selectedDocument,
    setDocuments,
    actionType,
    dialogOpen,
    isLoading,
    isProcessing,
    documentListDialogRef,
    handleDocDetails,
    handleAction,
    handleConfirmAction,
    setDialogOpen,
    getTitle
  }
}
