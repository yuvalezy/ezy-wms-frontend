import React, {useEffect, useRef, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {Status} from "@/features/shared/data/shared";
import DocumentListDialog, {DocumentListDialogRef} from "@/features/goods-receipt/components/DocumentListDialog";
import DocumentCard from "@/features/goods-receipt/components/DocumentCard";
import DocumentTable from "@/features/goods-receipt/components/DocumentTable";
import {Alert, AlertDescription} from "@/components";
import {AlertCircle} from "lucide-react";
import {ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {goodsReceiptService} from "@/features/goods-receipt/data/goods-receipt-service";
import {ProcessType} from "@/features/shared/data";
import {Skeleton} from "@/components/ui/skeleton";

export default function GoodsReceipt({processType = ProcessType.Regular}: { processType?: ProcessType }) {
  const {setError} = useThemeContext();
  const {t} = useTranslation();
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const [selectedDocument, setSelectedDocument] = useState<ReceiptDocument | null>(null);
  const [documents, setDocuments] = useState<ReceiptDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    goodsReceiptService.search({statuses: [Status.Open, Status.InProgress], processType})
      .then((data) => setDocuments(data))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false))
  }, [setError, processType]);

  function handleDocDetails(doc: ReceiptDocument) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  const getTitle = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return t('receiptConfirmation');
      case ProcessType.TransferConfirmation:
        return t('transferConfirmation');
      default:
        return t("goodsReceipt");
    }
  };

  const CardsSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-24" aria-label="Loading..." />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ContentTheme title={getTitle()}>
      {isLoading ? (
        <>
          {/* Mobile view - Cards Skeleton */}
          <div className="block sm:hidden">
            <CardsSkeleton />
          </div>
          
          {/* Desktop view - Table Skeleton */}
          <div className="hidden sm:block">
            <DocumentTable documents={[]} docDetails={handleDocDetails} processType={processType} supervisor={false} loading={true} />
          </div>
        </>
      ) : documents.length > 0 ? (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} docDetails={handleDocDetails} processType={processType}/>
            ))}
          </div>
          
          {/* Desktop view - Table */}
          <div className="hidden sm:block">
            <DocumentTable documents={documents} docDetails={handleDocDetails} processType={processType} supervisor={false} loading={false} />
          </div>
        </>
      ) : (
        <Alert variant="information">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>
            {processType === ProcessType.Regular ? t("noGoodsReceiptData") : t("noConfirmationData")}
          </AlertDescription>
        </Alert>
      )}
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentTheme>
  );
}
