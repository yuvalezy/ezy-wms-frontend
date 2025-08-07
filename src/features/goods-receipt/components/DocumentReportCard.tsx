import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useTranslation} from "react-i18next";
import {activeStatuses, processStatuses} from "@/features/goods-receipt/data/goods-receipt-utils";
import {FullInfoBox, InfoBoxValue} from "@/components/InfoBox";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {ArrowRightLeft, FileText, Truck} from "lucide-react";
import {useAuth} from "@/components";
import {DocumentItem, ReceiptDocument} from "@/features/goods-receipt/data/goods-receipt";
import {useGoodsReceiptHandleOpen} from "@/features/goods-receipt/hooks/useGoodsReceiptHandleOpen";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";
import {useObjectName} from "@/hooks/useObjectName";
import {ProcessType} from "@/features/shared/data";

type DocumentReportCardProps = {
  doc: ReceiptDocument,
  docDetails: (doc: ReceiptDocument) => void,
  processType?: ProcessType
}

const DocumentReportCard: React.FC<DocumentReportCardProps> = ({doc, docDetails, processType = ProcessType.Regular}) => {
  const {t} = useTranslation();
  const {user, displayVendor} = useAuth();
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();
  const handleOpen = useGoodsReceiptHandleOpen(processType);
  const o = useObjectName();

  const formatDocumentsList = (documents: DocumentItem[]) => {
    return documents.map((value, index) => (
      `${index > 0 ? ', ' : ''}${o(value.objectType)} #${value.documentNumber}`
    )).join('');
  }

  return (
    <Card key={doc.id}>
      <CardHeader>
        <CardTitle>{`${t('number')}: ${doc.number}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <FullInfoBox>
            {doc.name && <InfoBoxValue label={t('id')} value={doc.name}/>}
            {doc.vendor && displayVendor &&
                <InfoBoxValue label={processType === ProcessType.TransferConfirmation ? t('from') : t('vendor')} value={doc.vendor.name ?? doc.vendor.id}/>}
            {doc.documents && doc.documents.length > 0 &&
                <InfoBoxValue label={processType === ProcessType.TransferConfirmation ? t('transfersList') : t('documentsList')} value={formatDocumentsList(doc.documents)}
                              onClick={() => docDetails(doc)}/>
            }
            <InfoBoxValue label={t('docDate')} value={dateFormat(new Date(doc.date))}/>
            <InfoBoxValue label={t('createdBy')} value={doc.createdByUserName}/>
            <InfoBoxValue label={t('status')} value={documentStatusToString(doc.status)}/>
            {doc.updatedAt &&
                <InfoBoxValue label={t('statusDate')} value={dateFormat(doc.updatedAt)}/>}
          </FullInfoBox></div>
        <Separator className="my-4"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="outline" className="w-full" onClick={() => handleOpen('all', doc.id)}>
            <FileText className="h-4 w-4 mr-2"/>
            {processType === ProcessType.Regular ? t('goodsReceiptReport') : processType === ProcessType.Confirmation ? t('confirmationReport') : t('transferConfirmationReport')}
          </Button>
          {user?.settings?.goodsReceiptTargetDocuments && activeStatuses.includes(doc.status) && (
            <Button variant="outline" className="w-full" onClick={() => handleOpen('vs', doc.id)}>
              <Truck className="h-4 w-4 mr-2"/>
              {processType === ProcessType.Regular ? t('goodsReceiptVSExit') : processType === ProcessType.Confirmation ? t('confirmationReceiptVSExit') : t('transferVSExit')}
            </Button>
          )}
          {processStatuses.includes(doc.status) && (
            <Button variant="outline" className="w-full" onClick={() => handleOpen('diff', doc.id)}>
              <ArrowRightLeft className="h-4 w-4 mr-2"/>
              {t('differencesReport')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentReportCard;
