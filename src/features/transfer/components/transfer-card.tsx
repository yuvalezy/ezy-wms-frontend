import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {RoleType} from "@/assets/RoleType";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {Status} from "@/assets/Common";
import {useDateTimeFormat} from "@/assets/DateFormat";
import {CheckCircle, XCircle} from "lucide-react";
import {formatNumber} from "@/lib/utils";
import {FullInfoBox, InfoBoxValue, SecondaryInfoBox} from "@/components";
import InfoBox from "@/components/InfoBox";
import {TransferDocument} from "@/features/transfer/data/transfer";

type TransferCardProps = {
  doc: TransferDocument,
  onAction?: (transfer: TransferDocument, action: 'approve' | 'cancel') => void,
  supervisor?: boolean,
  header?: boolean
}

const TransferCard: React.FC<TransferCardProps> = ({doc, onAction, supervisor = false, header = true}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();

  function handleOpen(transfer: TransferDocument) {
    navigate(`/transfer/${transfer.id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.TRANSFER);

  const documentStatusToString = useDocumentStatusToString();
  const progressDisplayValue = doc.progress ?? 0;

  return (
    <Card key={doc.id} className={header ? "mb-4 shadow-lg" : "shadow-lg"}>
      <CardContent className="py-4">
        <FullInfoBox>
          <InfoBoxValue label={t('number')} value={doc.number}
                        onClick={handleOpenLink ? () => handleOpen(doc) : undefined}/>
          {doc.name && <InfoBoxValue label={t('id')} value={doc.name}/>}
          <InfoBoxValue label={t('docDate')} value={dateFormat(doc.date)}/>
          <InfoBoxValue label={t('createdBy')} value={doc.createdByUser?.fullName}/>
          <InfoBoxValue label={t('status')} value={documentStatusToString(doc.status)}/>
        </FullInfoBox>
        {doc.comments &&
            <InfoBox>
                <InfoBoxValue label={t('comment')} value={doc.comments}/>
            </InfoBox>}
        <ul className="space-y-2 text-sm">
          <li className="pt-2">
            <Progress value={progressDisplayValue} className="w-full"/>
            <p
              className="text-xs text-muted-foreground text-center mt-1">{formatNumber(progressDisplayValue, 0)}% {t('progress')}</p>
          </li>
        </ul>
      </CardContent>
      {supervisor && (
        <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
          {doc.status === Status.InProgress && doc.progress === 100 && (
            <Button variant="default" onClick={() => onAction?.(doc, 'approve')}
                    className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle className="mr-2 h-4 w-4"/>{t('finish')}
            </Button>
          )}
          <Button variant="destructive" onClick={() => onAction?.(doc, 'cancel')}>
            <XCircle className="mr-2 h-4 w-4"/>{t('cancel')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default TransferCard;
