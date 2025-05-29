import React, {useEffect, useRef, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {fetchDocuments,} from "@/pages/GoodsReceipt/data/Document";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {Status} from "@/assets/Common";
import {Document} from "@/assets/Document";
import DocumentListDialog, {DocumentListDialogRef} from "@/pages/GoodsReceipt/components/DocumentListDialog";
import DocumentCard from "@/pages/GoodsReceipt/components/DocumentCard";
import {Alert, AlertDescription} from "@/components";
import {AlertCircle} from "lucide-react";

export default function GoodsReceipt({confirm = false}: { confirm?: boolean }) {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchDocuments({status: [Status.Open, Status.InProgress], confirm})
      .then((data) => setDocuments(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [setError, setLoading]);

  function handleDocDetails(doc: Document) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  return (
    <ContentTheme title={!confirm ? t("goodsReceipt") : t('receiptConfirmation')}>
      {documents.length > 0 ?
        documents.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} docDetails={handleDocDetails} confirm={confirm}/>
      )) :
        <Alert variant="information">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>
            {!confirm ? t("noGoodsReceiptData") : t("noConfirmationData")}
          </AlertDescription>
        </Alert>
      }
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentTheme>
  );
}
