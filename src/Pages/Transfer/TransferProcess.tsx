import ContentTheme from "../../components/ContentTheme";
import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Card, CardContent,
  CardHeader,
  useThemeContext
} from "@/components";
import {useTranslation} from "react-i18next";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faMap,
  faCheck,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import {Alert, AlertDescription} from "@/components/ui/alert";
import {IsNumeric, StringFormat} from "@/assets";
import {getProcessInfo, transferAction} from "./Data/TransferDocument";
import {useAuth} from "@/components";
import {toast} from "sonner";
import BinLocationScanner from "@/components/BinLocationScanner";

export default function TransferProcess() {
  const {scanCode} = useParams();
  const {user} = useAuth();
  const {t} = useTranslation();
  const [id, setID] = useState<number | null>();
  const [info, setInfo] = useState<{ isComplete: boolean, comments: string | null }>({
    isComplete: false,
    comments: null
  });
  const {setLoading, setError} = useThemeContext();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    if (scanCode === null || scanCode === undefined || !IsNumeric(scanCode)) {
      setID(null);
      return;
    }
    let value = parseInt(scanCode);
    setID(value);
    getProcessInfo(value)
      .then((result) => setInfo(result))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, []);


  function finish() {
    if (!info.isComplete || id == null)
      return;
    if (window.confirm(StringFormat(t("createTransferConfirm"), id))) {
      setLoading(true);
      transferAction(id, "approve")
        .then(() => {
          toast.success(t("transferApproved"));
          navigate(`/transfer`);
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => setLoading(false));
    }
  }

  return (
    <ContentTheme title={t("transfer")} titleOnClick={() => navigate(`/transfer`)}
                  titleBreadcrumbs={[{label: scanCode ?? ''}]}>
      {id && (
        <div className="grid gap-4">
          <Card>
            <CardContent>
              <BinLocationScanner label={t("scanTransferSourceBin")} onScan={(bin) => navigate(`/transfer/${id}/source?bin=${JSON.stringify(bin)}`)}/>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <BinLocationScanner label={t("scanTransferTargetBin")} onScan={(bin) => navigate(`/transfer/${id}/targetBins?bin=${JSON.stringify(bin)}`)}/>
            </CardContent>
          </Card>
          <div className="space-y-4 p-2">
            <Link to={`/transfer/${id}/source`} className="block">
              <div
                className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
                <FontAwesomeIcon icon={faClipboardList} className="text-2xl text-blue-500"/>
                <span className="text-lg font-semibold">{t("selectTransferSource")}</span>
              </div>
            </Link>
            <Link to={`/transfer/${id}/targetBins`} className="block">
              <div
                className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
                <FontAwesomeIcon icon={faMap} className="text-2xl text-blue-500"/>
                <span className="text-lg font-semibold">{t("selectTransferTargetBins")}</span>
              </div>
            </Link>
            {user?.settings.transferTargetItems && (
              <Link to={`/transfer/${id}/targetItems`} className="block">
                <div
                  className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
                  <FontAwesomeIcon icon={faMap} className="text-2xl text-blue-500"/>
                  <span className="text-lg font-semibold">{t("selectTransferTargetItems")}</span>
                </div>
              </Link>
            )}
            <div
              onClick={() => finish()}
              className={`bg-white rounded-lg shadow-md p-4 flex items-center space-x-4 transition-shadow duration-300 ${
                info.isComplete ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <FontAwesomeIcon icon={faCheck} className="text-2xl text-green-500"/>
              <span className="text-lg font-semibold">{t("finish")}</span>
            </div>
            {info.comments && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription>
                  <strong>{t("comment")}: </strong>{info.comments}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </ContentTheme>
  );
}
