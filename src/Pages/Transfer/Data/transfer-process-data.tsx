import {useNavigate, useParams} from "react-router-dom";
import {useAuth, useThemeContext} from "@/components";
import {useEffect, useState} from "react";
import {getProcessInfo, transferAction, TransferDocument} from "@/pages/transfer/data/transfer-document";
import {IsNumeric, StringFormat} from "@/assets";
import {toast} from "sonner";
import {useTranslation} from "react-i18next";

export const useTransferProcessData = () => {
  const {t} = useTranslation();
  const {scanCode} = useParams();
  const {user} = useAuth();
  const [id, setID] = useState<number | null>();
  const [info, setInfo] = useState<TransferDocument | null>(null);
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
    if (!info?.isComplete || id == null)
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
  return {
    id,
    info,
    finish,
    scanCode,
    user
  }
}