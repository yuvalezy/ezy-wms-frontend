import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription, useThemeContext} from "@/components";
import React, {useEffect, useState} from "react";
import {fetchTransfers, TransferDocument} from "@/pages/transfer/data/transfer-document";
import {Status} from "@/assets";
import TransferCard from "@/pages/transfer/components/transfer-card";
import {AlertCircle} from "lucide-react";

export default function Transfer() {
  const {setLoading, setError} = useThemeContext();
  const {t} = useTranslation();
  const [transfers, setTransfers] = useState<TransferDocument[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchTransfers({statuses: [Status.Open, Status.InProgress], progress: true})
      .then((data) => setTransfers(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [setError, setLoading]);

  return (
    <ContentTheme title={t("transfer")}>
      <div className="my-4">
        {transfers.length ?
          transfers.map((transfer, index) => (
            <TransferCard key={transfer.id} doc={transfer}/>
          )) :
          <Alert variant="information">
            <AlertCircle className="h-4 w-4"/>
            <AlertDescription>
              {t("noTransferData")}
            </AlertDescription>
          </Alert>
        }
      </div>
    </ContentTheme>
  );

}
