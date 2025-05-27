import React, {useEffect, useRef, useState} from "react";
import ContentThemeSapUI5 from "../../components/ContentThemeSapUI5";
import {fetchDocuments,} from "./Data/Document";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "../../Components/ThemeContext";
import {Status} from "../../Assets/Common";
import {Document} from "../../Assets/Document";
import DocumentCard from "./Components/DocumentCard";
import DocumentListDialog, {DocumentListDialogRef} from "./Components/DocumentListDialog";

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
    <ContentThemeSapUI5 title={t("goodsReceipt")} icon="cause">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} docDetails={handleDocDetails}/>
      ))}
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentThemeSapUI5>
  );
}
