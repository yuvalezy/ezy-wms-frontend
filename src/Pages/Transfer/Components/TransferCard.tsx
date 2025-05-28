import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {Authorization} from "@/Assets/Authorization";
import {useDocumentStatusToString} from "@/Assets/DocumentStatusString";
import {TransferDocument} from "../Data/TransferDocument";
import {Status} from "@/Assets/Common";
import {useDateTimeFormat} from "@/Assets/DateFormat";
import { CheckCircle, XCircle } from "lucide-react";

type TransferCardProps = {
  doc: TransferDocument,
  onAction?: (id: number, action: 'approve' | 'cancel') => void,
  supervisor?: boolean
}

const TransferCard: React.FC<TransferCardProps> = ({doc, onAction, supervisor = false}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();

  function handleOpen(id: number) {
    navigate(`/transfer/${id}`);
  }

  let handleOpenLink = user?.authorizations?.includes(Authorization.TRANSFER);

  const documentStatusToString = useDocumentStatusToString();
  const progressDisplayValue = doc.progress ?? 0;

  return (
    <Card key={doc.id} className="mb-4 shadow-lg">
      <CardHeader>
        <CardTitle>{doc.name ? `${t('id')} : ${doc.name}` : `${t('transfer')} #${doc.id}`}</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="font-semibold">{t('number')}:</span>
            {handleOpenLink ? (
              <a href="#" onClick={e => { e.preventDefault(); handleOpen(doc.id); }} className="text-blue-600 hover:underline">
                {doc.id}
              </a>
            ) : (
              <span>{doc.id}</span>
            )}
          </li>
          <li className="flex justify-between">
            <span className="font-semibold">{t('docDate')}:</span>
            <span>{dateFormat(new Date(doc.date))}</span>
          </li>
          <li className="flex justify-between">
            <span className="font-semibold">{t('createdBy')}:</span>
            <span>{doc.employee.name}</span>
          </li>
          <li className="flex justify-between">
            <span className="font-semibold">{t('status')}:</span>
            <span>{documentStatusToString(doc.status)}</span>
          </li>
          {doc.comments && (
            <li className="pt-1">
              <span className="font-semibold">{t('comment')}:</span> {doc.comments}
            </li>
          )}
          <li className="pt-2">
            <Progress value={progressDisplayValue} className="w-full" />
             <p className="text-xs text-muted-foreground text-center mt-1">{progressDisplayValue.toFixed(0)}% {t('progress')}</p>
          </li>
        </ul>
      </CardContent>
      {supervisor && (
        <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
          {doc.status === Status.InProgress && doc.progress === 100 && (
            <Button variant="default" onClick={() => onAction?.(doc.id, 'approve')} className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle className="mr-2 h-4 w-4" />{t('finish')}
            </Button>
          )}
          <Button variant="destructive" onClick={() => onAction?.(doc.id, 'cancel')}>
            <XCircle className="mr-2 h-4 w-4" />{t('cancel')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default TransferCard;
