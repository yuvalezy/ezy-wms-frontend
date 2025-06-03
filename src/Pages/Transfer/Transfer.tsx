import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription, useThemeContext} from "@/components";
import React, {useEffect, useState} from "react";
import {fetchTransfers, TransferDocument} from "@/pages/transfer/data/transfer-document";
import {Status} from "@/assets";
import TransferCard from "@/pages/transfer/components/transfer-card";
import {AlertCircle} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Progress} from "@/components/ui/progress";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {RoleType} from "@/assets/RoleType";
import {useDateTimeFormat} from "@/assets/DateFormat";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {formatNumber} from "@/lib/utils";

export default function Transfer() {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const [transfers, setTransfers] = useState<TransferDocument[]>([]);
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();

  useEffect(() => {
    setLoading(true);
    fetchTransfers({statuses: [Status.Open, Status.InProgress], progress: true})
      .then((data) => setTransfers(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [setError, setLoading]);

  function handleOpen(id: number) {
    navigate(`/transfer/${id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.TRANSFER);

  return (
    <ContentTheme title={t("transfer")}>
      <div className="my-4">
        {transfers.length ? (
          <>
            {/* Mobile view - Cards */}
            <div className="block sm:hidden">
              {transfers.map((transfer) => (
                <TransferCard key={transfer.id} doc={transfer}/>
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
                    <TableHead>{t('progress')}</TableHead>
                    <TableHead>{t('comment')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((doc) => {
                    const progressDisplayValue = doc.progress ?? 0;
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.name || '-'}</TableCell>
                        <TableCell>
                          {handleOpenLink ? (
                            <a href="#" onClick={(e) => { e.preventDefault(); handleOpen(doc.id); }} className="text-blue-600 hover:underline">
                              {doc.number}
                            </a>
                          ) : (
                            doc.number
                          )}
                        </TableCell>
                        <TableCell>{dateFormat(doc.date)}</TableCell>
                        <TableCell>{doc.createdByUser?.name}</TableCell>
                        <TableCell>{documentStatusToString(doc.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={progressDisplayValue} className="w-20" />
                            <span className="text-xs">{formatNumber(progressDisplayValue, 0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{doc.comments || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <Alert variant="information">
            <AlertCircle className="h-4 w-4"/>
            <AlertDescription>
              {t("noTransferData")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ContentTheme>
  );

}
