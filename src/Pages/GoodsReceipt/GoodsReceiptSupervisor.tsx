import React from "react";
import DocumentCard from "@/features/goods-receipt/components/DocumentCard";
import DocumentTable from "@/features/goods-receipt/components/DocumentTable";
import {useTranslation} from "react-i18next";
import {StringFormat} from "@/utils/string-utils";
import ContentTheme from "@/components/ContentTheme";
import {MessageBox} from "@/components/ui/message-box";
import {useGoodsReceiptSupervisorData} from "@/features/goods-receipt/hooks/useGoodsReceiptSupervisorData";
import DocumentForm from "@/features/goods-receipt/components/DocumentForm";
import DocumentListDialog from "@/features/goods-receipt/components/DocumentListDialog";
import {ProcessType} from "@/features/shared/data";

export default function GoodsReceiptSupervisor({processType = ProcessType.Regular}: {processType?: ProcessType}) {
  const {t} = useTranslation();
  const {
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
    getTitle
  } = useGoodsReceiptSupervisorData(processType);
  return (
    <ContentTheme title={getTitle()}>
      <DocumentForm
        processType={processType}
        onNewDocument={(newDocument) =>
          setDocuments((prevDocs) => [newDocument, ...prevDocs])
        }
      />
      {/* Mobile view - Cards */}
      <div className="block sm:hidden">
        {documents.map((doc) => (
          <DocumentCard supervisor={supervisor} key={doc.id} doc={doc} action={handleAction}
                        docDetails={handleDocDetails} processType={processType}/>
        ))}
      </div>
      
      {/* Desktop view - Table */}
      <div className="hidden sm:block">
        <DocumentTable documents={documents} supervisor={supervisor} action={handleAction} 
                       docDetails={handleDocDetails} processType={processType} />
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
          selectedDocument?.number
        )}
        description={t('actionCannotReverse')}
      />
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentTheme>
  );
}
