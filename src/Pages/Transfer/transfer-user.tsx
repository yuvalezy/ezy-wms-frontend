import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription, useThemeContext} from "@/components";
import React, {useEffect, useState} from "react";
import {Status} from "@/features/shared/data";
import TransferCard from "@/features/transfer/components/transfer-card";
import TransferTable from "@/features/transfer/components/transfer-table";
import {AlertCircle} from "lucide-react";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";
import {TransferUserTableSkeleton} from "@/features/transfer/components/transfer-user-table-skeleton";
import {TransferUserCardSkeleton} from "@/features/transfer/components/transfer-user-card-skeleton";

export default function TransferUser() {
  const {setError} = useThemeContext();
  const {t} = useTranslation();
  const [transfers, setTransfers] = useState<TransferDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    transferService.search({statuses: [Status.Open, Status.InProgress], progress: true})
      .then((data) => setTransfers(data))
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [setError]);

  return (
    <ContentTheme title={t("transfer")}>
      <div className="my-4">
        {isLoading ? (
          <>
            {/* Mobile view - Card skeletons */}
            <div className="block sm:hidden" aria-label="Loading...">
              {Array.from({ length: 3 }).map((_, index) => (
                <TransferUserCardSkeleton key={index} />
              ))}
            </div>

            {/* Desktop view - Table skeleton */}
            <div className="hidden sm:block" aria-label="Loading...">
              <TransferUserTableSkeleton />
            </div>
          </>
        ) : transfers.length ? (
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
