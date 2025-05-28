import React from "react";
import DocumentCard from "./components/DocumentCard";
import {useTranslation} from "react-i18next";
import {StringFormat} from "@/assets/Functions";
import DocumentListDialog from "./components/DocumentListDialog";
import ContentTheme from "@/components/ContentTheme";
import DocumentForm from "@/pages/GoodsReceipt/components/DocumentForm";
import {MessageBox} from "@/components/ui/message-box";
import {useGoodReceiptSupervisorData} from "@/pages/GoodsReceipt/Data/good-receipt-supervisor-data";

export default function GoodsReceiptSupervisor() {
  const {t} = useTranslation();
  const {
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
  } = useGoodReceiptSupervisorData();
  return (
    <ContentTheme title={getTitle()}>
      <DocumentForm
        onNewDocument={(newDocument) =>
          setDocuments((prevDocs) => [newDocument, ...prevDocs])
        }
      />
      <br/>
      <br/>
      {documents.map((doc) => (
        <DocumentCard supervisor={supervisor} key={doc.id} doc={doc} action={handleAction}
                      docDetails={handleDocDetails}/>
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
          selectedDocumentId
        )}
        description={t('actionCannotReverse')}
      />
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentTheme>
  );
}
