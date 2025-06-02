import React, {useEffect, useState} from "react";
import {useAuth} from "@/components/AppContext";
import ContentTheme from "../../components/ContentTheme";
import {useThemeContext} from "@/components/ThemeContext";
import {useTranslation} from "react-i18next";
import {StringFormat} from "@/assets/Functions";
import {countingAction, fetchCountings} from "@/pages/Counting/data/Counting";
import {Counting} from "@/assets/Counting";
import CountingCard from "@/pages/Counting/components/CountingCard";
import {ObjectAction, Status} from "@/assets/Common";
import {MessageBox} from "@/components/ui/message-box";
import { toast } from "sonner";
import CountingForm from "@/pages/Counting/components/CountingForm";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFileAlt} from '@fortawesome/free-solid-svg-icons';
import {CheckCircle, XCircle} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Authorization} from "@/assets/Authorization";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {useDateTimeFormat} from "@/assets/DateFormat";

export default function CountingSupervisor() {
  const {user} = useAuth();
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [countings, setCountings] = useState<Counting[]>([]);
  const [selectedID, setSelectedID] = useState<number | null>(
    null
  );
  const [actionType, setActionType] = useState<ObjectAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();
  
  function handleOpen(id: number) {
    navigate(`/counting/${id}`);
  }

  let handleOpenLink = user?.authorizations?.includes(Authorization.COUNTING);

  useEffect(() => {
    setLoading(true);
    fetchCountings()
      .then((data) => {
        setCountings(data);
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = (docId: number, action: ObjectAction) => {
    setSelectedID(docId);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirmAction = () => {
    setLoading(true);
    setDialogOpen(false);
    countingAction(selectedID!, actionType!, user!)
      .then(() => {
        setCountings((prev) =>
          prev.filter((count) => count.id !== selectedID)
        );
        toast.success(actionType === "approve" ? t("approved") : t("cancelled"));
      })
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  return (
    <ContentTheme title={t("countingSupervisor")}>
      <CountingForm
        onNewCounting={(newCounting) =>
          setCountings((prev) => [newCounting, ...prev])
        }
      />
      <br/>
      {/* Mobile view - Cards */}
      <div className="block sm:hidden">
        {countings.map((doc) => (
          <CountingCard supervisor={true} key={doc.id} doc={doc} handleAction={handleAction}/>
        ))}
      </div>
      
      {/* Desktop view - Table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('id')}</TableHead>
              <TableHead>{t('number')}</TableHead>
              <TableHead>{t('docDate')}</TableHead>
              <TableHead>{t('createdBy')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countings.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name || '-'}</TableCell>
                <TableCell>
                  {handleOpenLink ? (
                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpen(doc.id); }} className="text-blue-600 hover:underline">
                      {doc.id}
                    </a>
                  ) : (
                    doc.id
                  )}
                </TableCell>
                <TableCell>{dateFormat(new Date(doc.date))}</TableCell>
                <TableCell>{doc.employee.name}</TableCell>
                <TableCell>{documentStatusToString(doc.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/countingSummaryReport/${doc.id}`)}>
                      <FontAwesomeIcon icon={faFileAlt} className="mr-1"/>
                      {t('countingSummaryReport')}
                    </Button>
                    {doc.status === Status.InProgress && (
                      <Button variant="default" size="sm" onClick={() => handleAction?.(doc.id, 'approve')}
                              className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle className="mr-1 h-3 w-3"/>{t('finish')}
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleAction?.(doc.id, 'cancel')}>
                      <XCircle className="mr-1 h-3 w-3"/>{t('cancel')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <MessageBox
        onConfirm={handleConfirmAction}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        type="confirm"
        title={StringFormat(
          actionType === "approve"
            ? t("confirmFinishDocument")
            : t("confirmCancelDocument"),
          selectedID
        )}
        description={t('actionCannotReverse')}

      />
    </ContentTheme>
  );
}
