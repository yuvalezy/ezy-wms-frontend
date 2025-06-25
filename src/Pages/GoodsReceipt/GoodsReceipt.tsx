import React, {useEffect, useRef, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {fetchDocuments,} from "@/pages/GoodsReceipt/data/Document";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {Status} from "@/assets/Common";
import {ReceiptDocument} from "@/assets/ReceiptDocument";
import DocumentListDialog, {DocumentListDialogRef} from "@/pages/GoodsReceipt/components/DocumentListDialog";
import DocumentCard from "@/pages/GoodsReceipt/components/DocumentCard";
import DocumentTable from "@/pages/GoodsReceipt/components/DocumentTable";
import {Alert, AlertDescription} from "@/components";
import {AlertCircle} from "lucide-react";

export default function GoodsReceipt({confirm = false}: { confirm?: boolean }) {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const [selectedDocument, setSelectedDocument] = useState<ReceiptDocument | null>(null);
  const [documents, setDocuments] = useState<ReceiptDocument[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchDocuments({statuses: [Status.Open, Status.InProgress], confirm})
      .then((data) => setDocuments(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [setError, setLoading]);

  function handleDocDetails(doc: ReceiptDocument) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  return (
    <ContentTheme title={!confirm ? t("goodsReceipt") : t('receiptConfirmation')}>
      {documents.length > 0 ? (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} docDetails={handleDocDetails} confirm={confirm}/>
            ))}
          </div>
          
          {/* Desktop view - Table */}
          <div className="hidden sm:block">
            <DocumentTable documents={documents} docDetails={handleDocDetails} confirm={confirm} supervisor={false} />
          </div>
        </>
      ) : (
        <Alert variant="information">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>
            {!confirm ? t("noGoodsReceiptData") : t("noConfirmationData")}
          </AlertDescription>
        </Alert>
      )}
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentTheme>
  );
}
