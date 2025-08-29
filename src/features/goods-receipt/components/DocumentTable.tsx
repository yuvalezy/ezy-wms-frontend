import React from "react";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Check, X, FileText, Truck, ArrowRightLeft, MoreVertical} from 'lucide-react';
import {ResponsiveTableActions, TableAction} from '@/components/ui/responsive-table-actions';
import {useObjectName} from "@/hooks/useObjectName";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";
import {Status} from "@/features/shared/data/shared";
import {activeStatuses, processStatuses} from "@/features/goods-receipt/data/goods-receipt-utils";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {useNavigate} from "react-router";
import {DocumentItem, ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {useGoodsReceiptHandleOpen} from "@/features/goods-receipt/hooks/useGoodsReceiptHandleOpen";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {ProcessType} from "@/features/shared/data";
import {Skeleton} from "@/components/ui/skeleton";

type DocumentTableProps = {
  documents: ReceiptDocument[],
  supervisor?: boolean,
  action?: (doc: ReceiptDocument, action: 'approve' | 'cancel') => void,
  docDetails: (doc: ReceiptDocument) => void,
  processType?: ProcessType,
  loading?: boolean
}

const DocumentTable: React.FC<DocumentTableProps> = ({documents, supervisor = false, action, docDetails, processType = ProcessType.Regular, loading = false}) => {
  const {t} = useTranslation();
  const o = useObjectName();
  const documentStatusToString = useDocumentStatusToString();
  const {dateFormat} = useDateTimeFormat();
  const {user, displayVendor} = useAuth();
  const handleOpen = useGoodsReceiptHandleOpen(processType);
  const navigate = useNavigate();

  const getNavigationRole = () => {
    switch (processType) {
      case ProcessType.Confirmation:
        return RoleType.GOODS_RECEIPT_CONFIRMATION;
      case ProcessType.TransferConfirmation:
        return RoleType.TRANSFER;
      default:
        return RoleType.GOODS_RECEIPT;
    }
  };

  const handleOpenLink = user?.roles?.includes(getNavigationRole());

  const openLink = (doc: ReceiptDocument) => {
    switch (processType) {
      case ProcessType.Confirmation:
        navigate(`/goodsReceiptConfirmation/${doc.id}`);
        break;
      case ProcessType.TransferConfirmation:
        navigate(`/transferConfirmation/${doc.id}`);
        break;
      default:
        navigate(`/goodsReceipt/${doc.id}`);
    }
  };

  const formatDocumentsList = (documents: DocumentItem[]) => {
    let returnValue = documents.map((value, index) => (
      `${index > 0 ? ', ' : ''}${o(value.objectType)} #${value.documentNumber}`
    )).join('');
    if (returnValue.length > 50) {
      return returnValue.substring(0, 50) + '...';
    }
    return returnValue;
  }

  const getDocumentActions = (doc: ReceiptDocument): TableAction[] => {
    const actions: TableAction[] = [];

    // Primary report action
    actions.push({
      key: 'report',
      label: processType === ProcessType.Regular ? t('goodsReceiptReport') : t('confirmationReport'),
      icon: FileText,
      onClick: () => handleOpen('all', doc.id),
      variant: 'outline'
    });

    // VS Exit report (conditional)
    if (user?.settings?.goodsReceiptTargetDocuments && activeStatuses.includes(doc.status)) {
      actions.push({
        key: 'vs-exit',
        label: processType === ProcessType.Regular ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit'),
        icon: Truck,
        onClick: () => handleOpen('vs', doc.id),
        variant: 'outline'
      });
    }

    // Differences report (conditional)
    if ([Status.InProgress, Status.Processing, Status.Open].includes(doc.status)) {
      actions.push({
        key: 'differences',
        label: t('differencesReport'),
        icon: ArrowRightLeft,
        onClick: () => handleOpen('diff', doc.id),
        variant: 'outline'
      });
    }

    // Finish action (conditional)
    if (doc.status === Status.InProgress) {
      actions.push({
        key: 'finish',
        label: t('finish'),
        icon: Check,
        onClick: () => action?.(doc, 'approve'),
        variant: 'default',
        separator: true
      });
    }

    // Cancel action (always available)
    actions.push({
      key: 'cancel',
      label: t('cancel'),
      icon: X,
      onClick: () => action?.(doc, 'cancel'),
      variant: 'destructive',
      separator: true
    });

    return actions;
  };

  const TableSkeleton = () => (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">{t('number')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('docDate')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('createdBy')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('status')}</TableHead>
            {processType === ProcessType.Regular && displayVendor && <TableHead className="whitespace-nowrap">{t('vendor')}</TableHead>}
            <TableHead className="whitespace-nowrap">{t('documentsList')}</TableHead>
            {supervisor && <TableHead className="text-right whitespace-nowrap min-w-[100px] w-auto"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="whitespace-nowrap">
                <Skeleton className="h-4 w-12" aria-label="Loading..." />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              {processType === ProcessType.Regular && displayVendor && (
                <TableCell className="whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              )}
              <TableCell className="min-w-0">
                <Skeleton className="h-4 w-32" />
              </TableCell>
              {supervisor && (
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return <TableSkeleton />;
  }

  const displayId = documents.find(v => v.name != null && v.name != "") != null;

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            {displayId && <TableHead className="whitespace-nowrap">{t('id')}</TableHead>}
            <TableHead className="whitespace-nowrap">{t('number')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('docDate')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('createdBy')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('status')}</TableHead>
            {processType === ProcessType.Regular && displayVendor && <TableHead className="whitespace-nowrap">{t('vendor')}</TableHead>}
            <TableHead className="whitespace-nowrap">{t('documentsList')}</TableHead>
            {supervisor && <TableHead className="text-right whitespace-nowrap min-w-[100px] w-auto"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              {displayId && <TableCell className="whitespace-nowrap">{doc.name || '-'}</TableCell>}
              <TableCell className="whitespace-nowrap">
                {handleOpenLink ? (
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    openLink(doc);
                  }} className="text-blue-600 hover:underline">
                    {doc.number}
                  </a>
                ) : (
                  doc.number
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">{dateFormat(doc.date)}</TableCell>
              <TableCell className="whitespace-nowrap">{doc.createdByUserName}</TableCell>
              <TableCell className="whitespace-nowrap">{documentStatusToString(doc.status)}</TableCell>
              {processType === ProcessType.Regular && displayVendor && <TableCell className="whitespace-nowrap">
                {doc.vendor?.name ?? doc.vendor?.id ?? '-'}
              </TableCell>}
              <TableCell className="min-w-0">
                {doc.documents && doc.documents?.length > 0 ? (
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    docDetails(doc);
                  }} className="text-blue-600 hover:underline truncate block">
                    {formatDocumentsList(doc.documents)}
                  </a>
                ) : '-'}
              </TableCell>
              {supervisor && (
                <TableCell className="text-right">
                  <ResponsiveTableActions actions={getDocumentActions(doc)} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default DocumentTable;