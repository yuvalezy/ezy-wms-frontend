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

export default function GoodsReceipt({processType = ProcessType.Regular}: { processType?: ProcessType }) {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const [selectedDocument, setSelectedDocument] = useState<ReceiptDocument | null>(null);
  const [documents, setDocuments] = useState<ReceiptDocument[]>([]);

  useEffect(() => {
    setLoading(true);
    goodsReceiptService.search({statuses: [Status.Open, Status.InProgress], processType})
      .then((data) => setDocuments(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [setError, setLoading, processType]);

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

  const confirm = processType === ProcessType.Confirmation || processType === ProcessType.TransferConfirmation;

  return (
    <ContentTheme title={getTitle()}>
      {documents.length > 0 ? (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} docDetails={handleDocDetails} processType={processType}/>
            ))}
          </div>
          
          {/* Desktop view - Table */}
          <div className="hidden sm:block">
            <DocumentTable documents={documents} docDetails={handleDocDetails} processType={processType} supervisor={false} />
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
