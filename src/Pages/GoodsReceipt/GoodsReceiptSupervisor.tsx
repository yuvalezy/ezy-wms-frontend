import React from "react";
import DocumentCard from "@/pages/GoodsReceipt/components/DocumentCard";
import {useTranslation} from "react-i18next";
import {StringFormat} from "@/assets/Functions";
import ContentTheme from "@/components/ContentTheme";
import {MessageBox} from "@/components/ui/message-box";
import {useGoodsReceiptSupervisorData} from "@/pages/GoodsReceipt/data/goods-receipt-supervisor-data";
import DocumentForm from "@/pages/GoodsReceipt/components/DocumentForm";
import DocumentListDialog from "@/pages/GoodsReceipt/components/DocumentListDialog";

export default function GoodsReceiptSupervisor({confirm = false}: {confirm?: boolean}) {
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
  } = useGoodsReceiptSupervisorData();
  return (
    <ContentTheme title={getTitle()}>
      <DocumentForm
        confirm={confirm}
        onNewDocument={(newDocument) =>
          setDocuments((prevDocs) => [newDocument, ...prevDocs])
        }
      />
      {documents.map((doc) => (
        <DocumentCard supervisor={supervisor} key={doc.id} doc={doc} action={handleAction}
                      docDetails={handleDocDetails} confirm={confirm}/>
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
