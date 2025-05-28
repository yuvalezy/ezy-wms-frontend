import React from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {Authorization} from "@/assets/Authorization";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {Counting} from "@/assets/Counting";
import {Status} from "@/assets/Common";
import {useDateTimeFormat} from "@/assets/DateFormat";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileAlt} from "@fortawesome/free-solid-svg-icons";

type CountingCardProps = {
  doc: Counting,
  handleAction?: (docId: number, action: 'approve' | 'cancel') => void,
  supervisor?: boolean
}

const CountingCard: React.FC<CountingCardProps> = ({doc, handleAction, supervisor = false}) => {
  const {t} = useTranslation();
  const {dateFormat} = useDateTimeFormat();
  const navigate = useNavigate();
  const {user} = useAuth();

  function handleOpen(id: number) {
    navigate(`/counting/${id}`);
  }

  let handleOpenLink = user?.authorizations?.includes(Authorization.COUNTING);

  const documentStatusToString = useDocumentStatusToString();

  return (
    <Card key={doc.id} className="mb-4 shadow-lg">
      {doc.name && (
        <CardHeader>
          <CardTitle>{`${t('id')} : ${doc.name}`}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="py-4">
        <ul className="space-y-2">
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
          {supervisor && (
            <li className="flex justify-between items-center pt-2 border-t mt-2">
              <Button variant="outline" className="w-full" onClick={e => { e.preventDefault(); navigate(`/countingSummaryReport/${doc.id}`); }}>
                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                {t('countingSummaryReport')}
              </Button>
            </li>
          )}
        </ul>
      </CardContent>
      {supervisor && (
        <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
          {doc.status === Status.InProgress && (
            <Button variant="default" onClick={() => handleAction?.(doc.id, 'approve')} className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle className="mr-2 h-4 w-4" />{t('finish')}
            </Button>
          )}
          <Button variant="destructive" onClick={() => handleAction?.(doc.id, 'cancel')}>
            <XCircle className="mr-2 h-4 w-4" />{t('cancel')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default CountingCard;
