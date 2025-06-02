import React from "react";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faTimes, faFileAlt, faTruckLoading, faExchangeAlt} from '@fortawesome/free-solid-svg-icons';
import {Document, DocumentItem} from "@/assets/Document";
import {useObjectName} from "@/assets/ObjectName";
import {Authorization} from "@/assets/Authorization";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {Status} from "@/assets/Common";
import {activeStatuses, processStatuses, useHandleOpen} from "@/pages/GoodsReceipt/data/GoodsReceiptUtils";
import {useDateTimeFormat} from "@/assets/DateFormat";
import {useNavigate} from "react-router-dom";

type DocumentTableProps = {
  documents: Document[],
  supervisor?: boolean,
  action?: (docId: number, action: 'approve' | 'cancel') => void,
  docDetails: (doc: Document) => void,
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

  const handleOpenLink = !confirm ? user?.authorizations?.includes(Authorization.GOODS_RECEIPT) : user?.authorizations?.includes(Authorization.GOODS_RECEIPT_CONFIRMATION);

  const openLink = (doc: Document) => {
    if (!confirm)
      navigate(`/goodsReceipt/${doc.id}`);
    else
      navigate(`/goodsReceiptConfirmation/${doc.id}`);
  };

  const formatDocumentsList = (documents: DocumentItem[]) => {
    return documents.map((value, index) => (
      `${index > 0 ? ', ' : ''}${o(value.objectType)} #${value.documentNumber}`
    )).join('');
  }

  return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('id')}</TableHead>
            <TableHead>{t('number')}</TableHead>
            <TableHead>{t('docDate')}</TableHead>
            <TableHead>{t('createdBy')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('vendor')}</TableHead>
            <TableHead>{t('documentsList')}</TableHead>
            {supervisor && <TableHead className="text-right">{t('actions')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.name || '-'}</TableCell>
              <TableCell>
                {handleOpenLink ? (
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    openLink(doc);
                  }} className="text-blue-600 hover:underline">
                    {doc.id}
                  </a>
                ) : (
                  doc.id
                )}
              </TableCell>
              <TableCell>{dateFormat(new Date(doc.date))}</TableCell>
              <TableCell>{doc.employee.name}</TableCell>
              <TableCell>{documentStatusToString(doc.status)}</TableCell>
              <TableCell>{doc.businessPartner?.name ?? doc.businessPartner?.code ?? '-'}</TableCell>
              <TableCell>
                {doc.specificDocuments && doc.specificDocuments?.length > 0 ? (
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    docDetails(doc);
                  }} className="text-blue-600 hover:underline">
                    {formatDocumentsList(doc.specificDocuments)}
                  </a>
                ) : '-'}
              </TableCell>
              {supervisor && (
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
                    {doc.status === Status.InProgress && (
                      <Button size="sm" onClick={() => action?.(doc.id, 'approve')}>
                        <FontAwesomeIcon icon={faCheck} className="mr-1"/>
                        {t('finish')}
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => action?.(doc.id, 'cancel')}>
                      <FontAwesomeIcon icon={faTimes} className="mr-1"/>
                      {t('cancel')}
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
  );
}

export default DocumentTable;