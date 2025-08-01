import React, {useEffect, useRef, useState} from "react";
import ContentTheme from "../../components/ContentTheme";
import ReportFilterForm, {ReportFilterFormRef} from "@/features/goods-receipt/components/ReportFilterForm";
import DocumentReportCard from "@/features/goods-receipt/components/DocumentReportCard";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import DocumentListDialog, {DocumentListDialogRef} from "@/features/goods-receipt/components/DocumentListDialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {MoreVertical, ArrowRightLeft, FileText, Truck} from 'lucide-react';
import {activeStatuses} from "@/features/goods-receipt/data/goods-receipt-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useAuth} from "@/components";
import {DocumentItem, GoodsReceiptReportFilter, ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {goodsReceiptService} from "@/features/goods-receipt/data/goods-receipt-service";
import {useGoodsReceiptHandleOpen} from "@/features/goods-receipt/hooks/useGoodsReceiptHandleOpen";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";
import {useObjectName} from "@/hooks/useObjectName";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {ProcessType} from "@/features/shared/data";

interface GoodsReceiptReportProps {
  processType?: ProcessType
}

export function GoodsReceiptReport({processType = ProcessType.Regular}: GoodsReceiptReportProps) {
  const {loading, setLoading, setError} = useThemeContext();
  const {user} = useAuth();
  const {t} = useTranslation();
  const [documents, setDocuments] = useState<ReceiptDocument[]>([]);
  const [lastId, setLastID] = useState("");
  const [filters, setFilters] = useState<GoodsReceiptReportFilter | null>(null);
  const [stop, setStop] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ReceiptDocument | null>(null);
  const documentListDialogRef = useRef<DocumentListDialogRef>(null);
  const reportFilterFormRef = useRef<ReportFilterFormRef>(null);
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();
  const handleOpen = useGoodsReceiptHandleOpen(processType);
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
  const lastIdRef = useRef<string>(lastId);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    lastIdRef.current = lastId;
  }, [lastId]);

  const onSubmit = (filters: GoodsReceiptReportFilter) => {
    setDocuments([]);
    setFilters(filters);
    setLastID("");
    setStop(false);
    loadData(filters);
  }

  const clear = () => {
    setDocuments([]);
    setFilters(null);
    setLastID("");
    setStop(false);
  }

  function handleDocDetails(doc: ReceiptDocument) {
    setSelectedDocument(doc);
    documentListDialogRef?.current?.show();
  }

  const loadData = (filters: GoodsReceiptReportFilter | null) => {
    if (!filters) {
      return;
    }
    setLoading(true);
    goodsReceiptService.search(filters)
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
  }, [loading, lastId]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop <= document.documentElement.offsetHeight - 50 || loading || !filtersRef.current || stop) {
      return;
    }
    setLoading(true);
    const newFilters = {...filtersRef.current, lastId: lastIdRef.current};
    setFilters(newFilters);
    loadData(newFilters);
  };

  const handleFilterToggle = () => {
    reportFilterFormRef.current?.togglePanel();
  };

  const getTitle = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return t('confirmationReport');
      case ProcessType.TransferConfirmation:
        return t('transferConfirmationReport');
      default:
        return t('goodsReceiptReport');
    }
  };

  return (
    <ContentTheme
      title={getTitle()}
      onFilterClicked={handleFilterToggle}
    >
      <ReportFilterForm
        ref={reportFilterFormRef}
        onSubmit={onSubmit}
        onClear={() => clear()}
        processType={processType}
        showTrigger={false}
      />
      {documents.length > 0 && (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden flex flex-col gap-2">
            {documents.map((doc) => (
              <DocumentReportCard key={doc.id} doc={doc} processType={processType} docDetails={handleDocDetails}/>
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
                    <TableCell>{doc.number}</TableCell>
                    <TableCell>{doc.vendor?.name ?? doc.vendor?.id ?? '-'}</TableCell>
                    <TableCell>
                      {doc.documents && doc.documents?.length > 0 ? (
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          handleDocDetails(doc);
                        }} className="text-blue-600 hover:underline">
                          {formatDocumentsList(doc.documents)}
                        </a>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{dateFormat(doc.date)}</TableCell>
                    <TableCell>{doc.createdByUserName}</TableCell>
                    <TableCell>{documentStatusToString(doc.status)}</TableCell>
                    <TableCell>{doc.updatedAt ? dateFormat(doc.updatedAt) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpen('all', doc.id)}>
                            <FileText className="mr-2 h-4 w-4"/>
                            {processType === ProcessType.Regular ? t('goodsReceiptReport') : t('confirmationReport')}
                          </DropdownMenuItem>
                          {user?.settings?.goodsReceiptTargetDocuments && activeStatuses.includes(doc.status) && (
                            <DropdownMenuItem onClick={() => handleOpen('vs', doc.id)}>
                              <Truck className="mr-2 h-4 w-4"/>
                              {processType === ProcessType.Regular ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit')}
                            </DropdownMenuItem>
                          )}
                          {activeStatuses.includes(doc.status) && (
                            <DropdownMenuItem onClick={() => handleOpen('diff', doc.id)}>
                              <ArrowRightLeft className="mr-2 h-4 w-4"/>
                              {t('differencesReport')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
