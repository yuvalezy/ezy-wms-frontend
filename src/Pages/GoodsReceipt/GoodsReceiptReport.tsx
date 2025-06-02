import React, {useEffect, useRef, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import ReportFilterForm, {ReportFilterFormRef} from "@/pages/GoodsReceipt/components/ReportFilterForm";
import {fetchDocuments, GoodsReceiptReportFilter} from "@/pages/GoodsReceipt/data/Document";
import DocumentReportCard from "@/pages/GoodsReceipt/components/DocumentReportCard";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {Document, DocumentItem} from "@/assets/Document";
import DocumentListDialog, {DocumentListDialogRef} from "@/pages/GoodsReceipt/components/DocumentListDialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExchangeAlt, faFileAlt, faTruckLoading} from '@fortawesome/free-solid-svg-icons';
import {useDocumentStatusToString, useObjectName, useDateTimeFormat} from "@/assets";
import {activeStatuses, processStatuses, useHandleOpen} from "@/pages/GoodsReceipt/data/GoodsReceiptUtils";

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
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();
  const handleOpen = useHandleOpen(confirm);
  const o = useObjectName();
  
  const formatDocumentsList = (documents: DocumentItem[]) => {
    const returnValue = documents.map((value, index) => (
      `${index > 0 ? ', ' : ''}${o(value.objectType)} #${value.documentNumber}`
    )).join('');
    if (returnValue.length > 50) {
      return returnValue.substring(0, 50) + '...';
    }
    return returnValue;
  };

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
      {documents.length > 0 && (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden flex flex-col gap-2">
            {documents.map((doc) => (
              <DocumentReportCard key={doc.id} doc={doc} confirm={confirm} docDetails={handleDocDetails}/>
            ))}
          </div>
          
          {/* Desktop view - Table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('id')}</TableHead>
                  <TableHead>{t('number')}</TableHead>
                  <TableHead>{t('vendor')}</TableHead>
                  <TableHead>{t('documentsList')}</TableHead>
                  <TableHead>{t('docDate')}</TableHead>
                  <TableHead>{t('createdBy')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('statusDate')}</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.name || '-'}</TableCell>
                    <TableCell>{doc.id}</TableCell>
                    <TableCell>{doc.businessPartner?.name ?? doc.businessPartner?.code ?? '-'}</TableCell>
                    <TableCell>
                      {doc.specificDocuments && doc.specificDocuments?.length > 0 ? (
                        <a href="#" onClick={(e) => { e.preventDefault(); handleDocDetails(doc); }} className="text-blue-600 hover:underline">
                          {formatDocumentsList(doc.specificDocuments)}
                        </a>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{dateFormat(new Date(doc.date))}</TableCell>
                    <TableCell>{doc.employee.name}</TableCell>
                    <TableCell>{documentStatusToString(doc.status)}</TableCell>
                    <TableCell>{doc.statusDate ? dateFormat(new Date(doc.statusDate)) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpen('all', doc.id)}>
                          <FontAwesomeIcon icon={faFileAlt} className="mr-1"/>
                          {!confirm ? t('goodsReceiptReport') : t('confirmationReport')}
                        </Button>
                        {activeStatuses.includes(doc.status) && (
                          <Button variant="outline" size="sm" onClick={() => handleOpen('vs', doc.id)}>
                            <FontAwesomeIcon icon={faTruckLoading} className="mr-1"/>
                            {!confirm ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit')}
                          </Button>
                        )}
                        {processStatuses.includes(doc.status) && (
                          <Button variant="outline" size="sm" onClick={() => handleOpen('diff', doc.id)}>
                            <FontAwesomeIcon icon={faExchangeAlt} className="mr-1"/>
                            {t('differencesReport')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      <DocumentListDialog ref={documentListDialogRef} doc={selectedDocument}/>
    </ContentTheme>
  );
}
