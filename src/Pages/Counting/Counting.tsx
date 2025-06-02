import React, {useEffect, useState} from "react";
import ContentTheme from "@/components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import {fetchCountings} from "@/pages/Counting/data/Counting";
import {Counting} from "@/assets/Counting";
import CountingCard from "@/pages/Counting/components/CountingCard";
import {Alert, AlertDescription} from "@/components";
import {AlertCircle} from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/components/AppContext";
import {Authorization} from "@/assets/Authorization";
import {useDocumentStatusToString} from "@/assets/DocumentStatusString";
import {useDateTimeFormat} from "@/assets/DateFormat";

export default function CountingList() {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const [data, setData] = useState<Counting[]>([]);
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat} = useDateTimeFormat();
  const documentStatusToString = useDocumentStatusToString();

  useEffect(() => {
    setLoading(true);
    fetchCountings()
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [setError, setLoading]);

  function handleOpen(id: number) {
    navigate(`/counting/${id}`);
  }

  let handleOpenLink = user?.authorizations?.includes(Authorization.COUNTING);

  return (
    <ContentTheme title={t("counting")}>
      {data.length ? (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {data.map((doc) => (
              <CountingCard key={doc.id} doc={doc}/>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((doc) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <Alert variant="information">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>
            {t("noCountingData")}
          </AlertDescription>
        </Alert>
      )}
    </ContentTheme>
  );
}
