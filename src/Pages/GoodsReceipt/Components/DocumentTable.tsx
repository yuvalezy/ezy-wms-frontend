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
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faTimes, faFileAlt, faTruckLoading, faExchangeAlt, faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import {ReceiptDocument, DocumentItem} from "@/assets/ReceiptDocument";
import {useObjectName} from "@/assets/ObjectName";
import {RoleType} from "@/assets/RoleType";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {Status} from "@/assets/Common";
import {activeStatuses, processStatuses, useHandleOpen} from "@/pages/GoodsReceipt/data/GoodsReceiptUtils";
import {useDateTimeFormat} from "@/assets/DateFormat";
import {useNavigate} from "react-router-dom";

type DocumentTableProps = {
  documents: ReceiptDocument[],
  supervisor?: boolean,
  action?: (doc: ReceiptDocument, action: 'approve' | 'cancel') => void,
  docDetails: (doc: ReceiptDocument) => void,
  confirm?: boolean
}

const DocumentTable: React.FC<DocumentTableProps> = ({documents, supervisor = false, action, docDetails, confirm}) => {
  const {t} = useTranslation();
  const o = useObjectName();
  const documentStatusToString = useDocumentStatusToString();
  const {dateFormat} = useDateTimeFormat();
  const {user} = useAuth();
  const handleOpen = useHandleOpen(confirm);
  const navigate = useNavigate();

  const handleOpenLink = !confirm ? user?.roles?.includes(RoleType.GOODS_RECEIPT) : user?.roles?.includes(RoleType.GOODS_RECEIPT_CONFIRMATION);

  const openLink = (doc: ReceiptDocument) => {
    if (!confirm)
      navigate(`/goodsReceipt/${doc.id}`);
    else
      navigate(`/goodsReceiptConfirmation/${doc.id}`);
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
            <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleOpen('all', doc.id)}>
            <FontAwesomeIcon icon={faFileAlt} className="mr-2 h-4 w-4" />
            {!confirm ? t('goodsReceiptReport') : t('confirmationReport')}
          </DropdownMenuItem>

          {user?.settings?.goodsReceiptTargetDocuments && activeStatuses.includes(doc.status) && (
            <DropdownMenuItem onClick={() => handleOpen('vs', doc.id)}>
              <FontAwesomeIcon icon={faTruckLoading} className="mr-2 h-4 w-4" />
              {!confirm ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit')}
            </DropdownMenuItem>
          )}

          {processStatuses.includes(doc.status) && (
            <DropdownMenuItem onClick={() => handleOpen('diff', doc.id)}>
              <FontAwesomeIcon icon={faExchangeAlt} className="mr-2 h-4 w-4" />
              {t('differencesReport')}
            </DropdownMenuItem>
          )}

          {doc.status === Status.InProgress && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => action?.(doc, 'approve')}>
                <FontAwesomeIcon icon={faCheck} className="mr-2 h-4 w-4" />
                {t('finish')}
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => action?.(doc, 'cancel')}
            className="text-red-600 focus:text-red-600"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
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
            {!confirm && <TableHead className="whitespace-nowrap">{t('vendor')}</TableHead>}
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
              {!confirm && <TableCell className="whitespace-nowrap">
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