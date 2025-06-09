import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription, useThemeContext} from "@/components";
import React, {useEffect, useState} from "react";
import {fetchTransfers, TransferDocument} from "@/pages/transfer/data/transfer-document";
import {Status} from "@/assets";
import TransferCard from "@/pages/transfer/components/transfer-card";
import TransferTable from "@/pages/transfer/components/transfer-table";
import {AlertCircle} from "lucide-react";

export default function TransferUser() {
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
              <TransferTable transfers={transfers} />
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
