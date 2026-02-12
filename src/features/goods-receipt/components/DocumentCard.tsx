import React from "react";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ArrowRightLeft, Check, FileText, Truck, X} from 'lucide-react';
import {useObjectName} from "@/hooks/useObjectName";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";
import {Status} from "@/features/shared/data/shared";
import {activeStatuses} from "@/features/goods-receipt/data/goods-receipt-utils";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {Separator} from "@/components/ui/separator";
import {FullInfoBox, InfoBoxValue} from "@/components/InfoBox";
import {useNavigate} from "react-router";
import {DocumentItem, ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {useGoodsReceiptHandleOpen} from "@/features/goods-receipt/hooks/useGoodsReceiptHandleOpen";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {ProcessType} from "@/features/shared/data";
import {ObjectAction} from "@/features/packages/types";

type DocumentCardProps = {
  doc: ReceiptDocument,
  supervisor?: boolean,
  action?: (doc: ReceiptDocument, action: ObjectAction) => void,
  docDetails: (doc: ReceiptDocument) => void,
  processType?: ProcessType
}

const DocumentCard: React.FC<DocumentCardProps> = ({doc, supervisor = false, action, docDetails, processType = ProcessType.Regular}) => {
  const {t} = useTranslation();
  const o = useObjectName();
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

  const openLink = () => {
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

  const documentStatusToString = useDocumentStatusToString();

  const formatDocumentsList = (documents: DocumentItem[]) => {
    return documents.map((value, index) => (
      `${index > 0 ? ', ' : ''}${o(value.objectType)} #${value.documentNumber}`
    )).join('');
  }
  return (
    <Card className="mb-4 shadow-lg">
      <CardContent className="grid text-sm gap-2">
        <FullInfoBox>
          {doc.name && <InfoBoxValue label={t('id')} value={doc.name}/>}
          <InfoBoxValue onClick={handleOpenLink ? openLink : undefined} label={t('number')} value={doc.number}/>
          <InfoBoxValue label={t('docDate')} value={dateFormat(doc.date)}/>
          <InfoBoxValue label={t('createdBy')} value={doc.createdByUserName}/>
          <InfoBoxValue label={t('status')} value={documentStatusToString(doc.status)}/>
        </FullInfoBox>
        {(doc.vendor && displayVendor || doc.documents) && <FullInfoBox>
          {doc.vendor && displayVendor && (
            <InfoBoxValue label={t('vendor')} value={doc.vendor.name ?? doc.vendor.id}/>
          )}
          {doc.documents && doc.documents?.length > 0 && (
            <InfoBoxValue label={t('documentsList')} value={formatDocumentsList(doc.documents)}
                          onClick={() => docDetails(doc)}/>
          )}
        </FullInfoBox>}

        {supervisor && (
          <>
            <Separator className="my-4"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" className="w-full" onClick={() => handleOpen('all', doc.id)}>
                <FileText className="mr-2 h-4 w-4"/>
                {processType === ProcessType.Regular ? t('goodsReceiptReport') : t('confirmationReport')}
              </Button>
              {user?.settings?.goodsReceiptTargetDocuments && activeStatuses.includes(doc.status) && (
                <Button variant="outline" className="w-full" onClick={() => handleOpen('vs', doc.id)}>
                  <Truck className="mr-2 h-4 w-4"/>
                  {processType === ProcessType.Regular ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit')}
                </Button>
              )}
              {[Status.InProgress, Status.Processing, Status.Open].includes(doc.status) && (
                <Button variant="outline" className="w-full" onClick={() => handleOpen('diff', doc.id)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4"/>
                  {t('differencesReport')}
                </Button>
              )}
              {doc.status === Status.InProgress && (
                <Button className="w-full" onClick={() => action?.(doc, 'process')}>
                  <Check className="mr-2 h-4 w-4"/>
                  {t('finish')}
                </Button>
              )}
              <Button variant="destructive" className="w-full" onClick={() => action?.(doc, 'cancel')}>
                <X className="mr-2 h-4 w-4"/>
                {t('cancel')}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default DocumentCard;
