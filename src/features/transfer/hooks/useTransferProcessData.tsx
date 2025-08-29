import {useNavigate, useParams} from "react-router";
import {useAuth, useThemeContext} from "@/components";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {useTranslation} from "react-i18next";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";
import {StringFormat} from "@/utils/string-utils";

export const useTransferProcessData = () => {
  const {t} = useTranslation();
  const {scanCode} = useParams();
  const {user} = useAuth();
  const [id, setID] = useState<string | null>();
  const [info, setInfo] = useState<TransferDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {setError} = useThemeContext();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    if (scanCode === null || scanCode === undefined) {
      setID(null);
      setIsLoading(false);
      return;
    }
    setID(scanCode);
    transferService.getProcessInfo(scanCode)
      .then((result) => setInfo(result))
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [setError]);


  function finish() {
    if (!info?.isComplete || id == null)
      return;
    if (window.confirm(StringFormat(t("createTransferConfirm"), info?.number))) {
      setIsLoading(true);
      transferService.process(id)
        .then((result) => {
          if (result.success) {
            toast.success(t("transferApproved"));
            navigate(`/transfer`);
          }
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => setIsLoading(false));
    }
  }
  return {
    id,
    info,
    finish,
    scanCode,
    user,
    isLoading
  }
}