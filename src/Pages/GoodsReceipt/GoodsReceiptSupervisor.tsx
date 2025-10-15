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
import {Skeleton} from "@/components/ui/skeleton";
import {Loader2} from "lucide-react";

export default function GoodsReceiptSupervisor({processType = ProcessType.Regular}: {processType?: ProcessType}) {
  const {t} = useTranslation();
  const {
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
  } = useGoodsReceiptSupervisorData(processType);

  const CardsSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ContentTheme title={getTitle()}>
      <DocumentForm
        processType={processType}
        onNewDocument={(newDocument) =>
          setDocuments((prevDocs) => [newDocument, ...prevDocs])
        }
      />
      
      {isLoading ? (
        <>
          {/* Mobile view - Cards Skeleton */}
          <div className="block sm:hidden">
            <CardsSkeleton />
          </div>
          
          {/* Desktop view - Table Skeleton */}
          <div className="hidden sm:block">
            <DocumentTable documents={[]} supervisor={supervisor} action={handleAction} 
                           docDetails={handleDocDetails} processType={processType} loading={true} />
          </div>
        </>
      ) : (
        <>
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
                           docDetails={handleDocDetails} processType={processType} loading={false} />
          </div>
        </>
      )}
      
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('processing')}</p>
          </div>
        </div>
      )}
      
      <MessageBox
        onConfirm={handleConfirmAction}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        type="confirm"
        title={StringFormat(
          actionType === "process"
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
