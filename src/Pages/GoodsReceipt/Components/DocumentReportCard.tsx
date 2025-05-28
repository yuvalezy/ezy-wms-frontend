import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useTranslation} from "react-i18next";
import {Document, DocumentItem, useDocumentStatusToString, useObjectName, useDateTimeFormat} from "@/assets";
import {activeStatuses, processStatuses, useHandleOpen} from "@/pages/GoodsReceipt/data/GoodsReceiptUtils";
import InfoBox, {InfoBoxValue, SecondaryInfoBox} from "@/components/InfoBox";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExchangeAlt, faFileAlt, faTruckLoading} from "@fortawesome/free-solid-svg-icons";

type DocumentReportCardProps = {
  doc: Document,
  docDetails: (doc: Document) => void,
  confirm: boolean
}

const DocumentReportCard: React.FC<DocumentReportCardProps> = ({doc, docDetails, confirm}) => {
  const {t} = useTranslation();
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();
  const handleOpen = useHandleOpen(confirm);
  const o = useObjectName();

  function documentDetailsClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    docDetails(doc);
  }

  const formatDocumentsList = (documents: DocumentItem[]) => {
    return documents.map((value, index) => (
      `${index > 0 ? ', ' : ''}${o(value.objectType)} #${value.documentNumber}`
    )).join('');
  }

  return (
    <Card key={doc.id}>
      <CardHeader>
        <CardTitle>{`${t('number')}: ${doc.id}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <InfoBox>
          {doc.name && <InfoBoxValue label={t('id')} value={doc.name}/>}
          {doc.businessPartner &&
              <InfoBoxValue label={t('vendor')} value={doc.businessPartner.name ?? doc.businessPartner.code}/>}
          {doc.specificDocuments && doc.specificDocuments.length > 0 &&
              <InfoBoxValue label={t('documentsList')} value={formatDocumentsList(doc.specificDocuments)}
                            onClick={() => docDetails(doc)}/>
          }
        </InfoBox>
        <SecondaryInfoBox>
          <InfoBoxValue label={t('docDate')} value={dateFormat(new Date(doc.date))}/>
          <InfoBoxValue label={t('createdBy')} value={doc.employee.name}/>
          <InfoBoxValue label={t('status')} value={documentStatusToString(doc.status)}/>
          {doc.statusDate &&
              <InfoBoxValue label={t('statusDate')} value={dateFormat(new Date(doc.statusDate))}/>}
        </SecondaryInfoBox>
        <Separator className="my-4"/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="outline" className="w-full" onClick={e => handleOpen(e, 'all', doc.id)}>
            <FontAwesomeIcon icon={faFileAlt} className="mr-2"/>
            {!confirm ? t('goodsReceiptReport') : t('confirmationReport')}
          </Button>
          {activeStatuses.includes(doc.status) && (
            <Button variant="outline" className="w-full" onClick={e => handleOpen(e, 'vs', doc.id)}>
              <FontAwesomeIcon icon={faTruckLoading} className="mr-2"/>
              {!confirm ? t('goodsReceiptVSExit') : t('confirmationReceiptVSExit')}
            </Button>
          )}
          {processStatuses.includes(doc.status) && (
            <Button variant="outline" className="w-full" onClick={e => handleOpen(e, 'diff', doc.id)}>
              <FontAwesomeIcon icon={faExchangeAlt} className="mr-2"/>
              {t('differencesReport')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentReportCard;
