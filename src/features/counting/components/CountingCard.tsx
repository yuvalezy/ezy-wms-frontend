import React from "react";
import {useNavigate} from "react-router";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";
import {Status} from "@/features/shared/data/shared";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {CheckCircle, Eye, FileText, XCircle} from "lucide-react";
import {FullInfoBox, InfoBoxValue, Separator} from "@/components";
import {Counting} from "@/features/counting/data/counting";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {ObjectAction} from "@/features/packages/types";

type CountingCardProps = {
  doc: Counting,
  handleAction?: (action: ObjectAction) => void,
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

  const isProcessingOrPartial = doc.status === Status.Processing || doc.status === Status.PartiallyProcessed;

  return (
    <Card key={doc.id} className="mb-4 shadow-lg">
      {doc.name && (
        <CardHeader>
          <CardTitle>{`${t('id')} : ${doc.name}`}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="py-4">
        <FullInfoBox>
          <InfoBoxValue label={t('number')} value={doc.number}
                        onClick={handleOpenLink ? () => handleOpen(doc.id) : undefined}/>
          <InfoBoxValue label={t('docDate')} value={dateFormat(doc.date)}/>
          <InfoBoxValue label={t('createdBy')} value={doc.createdByUser?.fullName}/>
          <InfoBoxValue label={t('status')} value={documentStatusToString(doc.status)}/>
        </FullInfoBox>
        {supervisor && (
          <>
            <Separator className="my-4"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={() => navigate(`/countingSummaryReport/${doc.id}`)}>
                  <FileText className="h-4 w-4 mr-2"/>
                  {t('countingSummaryReport')}
                </Button>
                {isProcessingOrPartial && (
                  <Button variant="outline" onClick={() => handleAction?.('viewBatches')}
                          className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Eye className="mr-2 h-4 w-4"/>{t('viewBatches')}
                  </Button>
                )}
                {doc.status === Status.InProgress && (
                  <Button variant="default" onClick={() => handleAction?.('process')}
                          className="bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle className="mr-2 h-4 w-4"/>{t('finish')}
                  </Button>
                )}
                <Button variant="destructive" onClick={() => handleAction?.('cancel')}
                        disabled={isProcessingOrPartial}>
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
