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
import {useObjectName} from "@/hooks/useObjectName";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";
import {Status} from "@/features/shared/data/shared";
import {activeStatuses, processStatuses} from "@/features/goods-receipt/data/goods-receipt-utils";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {useNavigate} from "react-router-dom";
import {DocumentItem, ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {useGoodsReceiptHandleOpen} from "@/features/goods-receipt/hooks/useGoodsReceiptHandleOpen";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {ProcessType} from "@/features/shared/data";

type DocumentTableProps = {
  documents: ReceiptDocument[],
  supervisor?: boolean,
  action?: (doc: ReceiptDocument, action: 'approve' | 'cancel') => void,
  docDetails: (doc: ReceiptDocument) => void,
  processType?: ProcessType
}

const DocumentTable: React.FC<DocumentTableProps> = ({documents, supervisor = false, action, docDetails, processType = ProcessType.Regular}) => {
  const {t} = useTranslation();
  const o = useObjectName();
  const documentStatusToString = useDocumentStatusToString();
  const {dateFormat} = useDateTimeFormat();
  const {user} = useAuth();
  const handleOpen = useGoodsReceiptHandleOpen(processType === ProcessType.Confirmation || processType === ProcessType.TransferConfirmation);
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

  const ActionsMenu = ({doc}: {doc: ReceiptDocument}) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleOpen('all', doc.id)}>
            <FileText className="mr-2 h-4 w-4" />
            {processType === ProcessType.Regular ? t('goodsReceiptReport') : t('confirmationReport')}
          </DropdownMenuItem>

          {user?.settings?.goodsReceiptTargetDocuments && activeStatuses.includes(doc.status) && (
            <DropdownMenuItem onClick={() => handleOpen('vs', doc.id)}>
              <Truck className="mr-2 h-4 w-4" />
              {processType === ProcessType.Regular ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit')}
            </DropdownMenuItem>
          )}

          {processStatuses.includes(doc.status) && (
            <DropdownMenuItem onClick={() => handleOpen('diff', doc.id)}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              {t('differencesReport')}
            </DropdownMenuItem>
          )}

          {doc.status === Status.InProgress && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => action?.(doc, 'approve')}>
                <Check className="mr-2 h-4 w-4" />
                {t('finish')}
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => action?.(doc, 'cancel')}
            className="text-red-600 focus:text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            {t('cancel')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">{t('id')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('number')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('docDate')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('createdBy')}</TableHead>
            <TableHead className="whitespace-nowrap">{t('status')}</TableHead>
            {processType === ProcessType.Regular && <TableHead className="whitespace-nowrap">{t('vendor')}</TableHead>}
            <TableHead className="whitespace-nowrap">{t('documentsList')}</TableHead>
            {supervisor && <TableHead className="text-right whitespace-nowrap w-16"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="whitespace-nowrap">{doc.name || '-'}</TableCell>
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
              {processType === ProcessType.Regular && <TableCell className="whitespace-nowrap">
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
                  <ActionsMenu doc={doc} />
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