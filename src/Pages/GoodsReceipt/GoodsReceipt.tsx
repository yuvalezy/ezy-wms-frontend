import React, {useEffect, useRef, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import {fetchDocuments,} from "./Data/Document";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {Status} from "@/assets/Common";
import {Document} from "@/assets/Document";
import DocumentCard from "./components/DocumentCard";
import DocumentListDialog, {DocumentListDialogRef} from "./components/DocumentListDialog";

export default function GoodsReceipt() {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchDocuments({status: [Status.Open, Status.InProgress]})
      .then((data) => setDocuments(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [setError, setLoading]);

  function handleDocDetails(doc: Document) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  return (
    <ContentTheme title={t("goodsReceipt")}>
      {documents.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} docDetails={handleDocDetails}/>
      ))}
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentTheme>
  );
}
