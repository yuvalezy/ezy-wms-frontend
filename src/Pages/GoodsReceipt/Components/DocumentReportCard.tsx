import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useTranslation} from "react-i18next";
import {ReceiptDocument, DocumentItem, useDocumentStatusToString, useObjectName, useDateTimeFormat} from "@/assets";
import {activeStatuses, processStatuses, useHandleOpen} from "@/pages/GoodsReceipt/data/GoodsReceiptUtils";
import InfoBox, {FullInfoBox, InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {ArrowRightLeft, FileText, Truck} from "lucide-react";
import {useAuth} from "@/components";

type DocumentReportCardProps = {
  doc: ReceiptDocument,
  docDetails: (doc: ReceiptDocument) => void,
  confirm: boolean
}

const DocumentReportCard: React.FC<DocumentReportCardProps> = ({doc, docDetails, confirm}) => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();
  const handleOpen = useHandleOpen(confirm);
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
            {doc.vendor &&
                <InfoBoxValue label={t('vendor')} value={doc.vendor.name ?? doc.vendor.id}/>}
            {doc.documents && doc.documents.length > 0 &&
                <InfoBoxValue label={t('documentsList')} value={formatDocumentsList(doc.documents)}
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
            {!confirm ? t('goodsReceiptReport') : t('confirmationReport')}
          </Button>
          {user?.settings?.goodsReceiptTargetDocuments && activeStatuses.includes(doc.status) && (
            <Button variant="outline" className="w-full" onClick={() => handleOpen('vs', doc.id)}>
              <Truck className="h-4 w-4 mr-2"/>
              {!confirm ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit')}
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
