import React, {useEffect, useRef, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import ReportFilterForm, {ReportFilterFormRef} from "@/pages/GoodsReceipt/components/ReportFilterForm";
import {fetchDocuments, GoodsReceiptReportFilter} from "@/pages/GoodsReceipt/data/Document";
import DocumentReportCard from "@/pages/GoodsReceipt/components/DocumentReportCard";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Document} from "@/assets/Document";
import DocumentListDialog, {DocumentListDialogRef} from "@/pages/GoodsReceipt/components/DocumentListDialog";

interface GoodsReceiptReportProps {
  confirm?: boolean
}

export default function GoodsReceiptReport({confirm = false}: GoodsReceiptReportProps) {
  const {loading, setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [lastID, setLastID] = useState(-1);
  const [filters, setFilters] = useState<GoodsReceiptReportFilter | null>(null);
  const [stop, setStop] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const reportFilterFormRef = useRef<ReportFilterFormRef>(null);

  const filtersRef = useRef<GoodsReceiptReportFilter | null>(filters);
  const lastIDRef = useRef<number>(lastID);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    lastIDRef.current = lastID;
  }, [lastID]);

  const onSubmit = (filters: GoodsReceiptReportFilter) => {
    setFilters(filters);
    loadData(filters);
  }

  function handleDocDetails(doc: Document) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  const loadData = (filters: GoodsReceiptReportFilter | null) => {
    if (stop || !filters) {
      return;
    }
    setLoading(true);
    fetchDocuments(filters)
      .then((data) => {
        if ((data?.length ?? 0) === 0) {
          setStop(true);
          return;
        }
        setDocuments(prevDocs => [...prevDocs, ...data]);
        setLastID(data[data.length - 1].id)
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, lastID]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop <= document.documentElement.offsetHeight - 50 || loading || !filtersRef.current || stop) {
      return;
    }
    setLoading(true);
    const newFilters = {...filtersRef.current, lastID: lastIDRef.current};
    setFilters(newFilters);
    loadData(newFilters);
  };

  const handleFilterToggle = () => {
    reportFilterFormRef.current?.togglePanel();
  };

  return (
    <ContentTheme 
      title={!confirm ? t('goodsReceiptReport') : t('confirmationReport')}
      onFilterClicked={handleFilterToggle}
    >
      <ReportFilterForm
        ref={reportFilterFormRef}
        onSubmit={onSubmit}
        onClear={() => setDocuments([])}
        confirm={confirm}
        showTrigger={false}
      />
      <div className="flex flex-col gap-2">
        {documents.map((doc) => (
          <DocumentReportCard key={doc.id} doc={doc} confirm={confirm} docDetails={handleDocDetails}/>
        ))}
      </div>
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentTheme>
  );
}
