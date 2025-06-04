import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {RoleType} from "@/assets/RoleType";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {Counting} from "@/assets/Counting";
import {Status} from "@/assets/Common";
import {useDateTimeFormat} from "@/assets/DateFormat";
import {CheckCircle, XCircle, FileText, Info} from "lucide-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileAlt} from "@fortawesome/free-solid-svg-icons";
import {InfoBoxValue, SecondaryInfoBox, Separator} from "@/components";

type CountingCardProps = {
  doc: Counting,
  handleAction?: (docId: string, action: 'approve' | 'cancel') => void,
  supervisor?: boolean
}

const CountingCard: React.FC<CountingCardProps> = ({doc, handleAction, supervisor = false}) => {
  const {t} = useTranslation();
  const {dateFormat} = useDateTimeFormat();
  const navigate = useNavigate();
  const {user} = useAuth();

  function handleOpen(id: string) {
    navigate(`/counting/${id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.COUNTING);

  const documentStatusToString = useDocumentStatusToString();

  return (
    <Card key={doc.id} className="mb-4 shadow-lg">
      {doc.name && (
        <CardHeader>
          <CardTitle>{`${t('id')} : ${doc.name}`}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="py-4">
        <SecondaryInfoBox>
          <InfoBoxValue label={t('number')} value={doc.number}
                        onClick={handleOpenLink ? () => handleOpen(doc.id) : undefined}/>
          <InfoBoxValue label={t('docDate')} value={dateFormat(doc.date)}/>
          <InfoBoxValue label={t('createdBy')} value={doc.createdByUser?.fullName}/>
          <InfoBoxValue label={t('status')} value={documentStatusToString(doc.status)}/>
        </SecondaryInfoBox>
        {supervisor && (
          <>
            <Separator className="my-4"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={() => navigate(`/countingSummaryReport/${doc.id}`)}>
                  <FontAwesomeIcon icon={faFileAlt} className="mr-2"/>
                  {t('countingSummaryReport')}
                </Button>
                {doc.status === Status.InProgress && (
                  <Button variant="default" onClick={() => handleAction?.(doc.id, 'approve')}
                          className="bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="mr-2 h-4 w-4"/>{t('finish')}
                  </Button>
                )}
                <Button variant="destructive" onClick={() => handleAction?.(doc.id, 'cancel')}>
                  <XCircle className="mr-2 h-4 w-4"/>{t('cancel')}
                </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default CountingCard;
