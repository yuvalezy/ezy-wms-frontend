import ContentTheme from "@/components/ContentTheme";
import {Link, useNavigate} from "react-router";
import {Button, Card, CardContent} from "@/components";
import {useTranslation} from "react-i18next";
import {Check, Map, Clock, AlertCircle} from 'lucide-react';
import BinLocationScanner from "@/components/BinLocationScanner";
import TransferCard from "@/features/transfer/components/transfer-card";
import {cn} from "@/utils/css-utils";
import {useTransferProcessData} from "@/features/transfer/hooks/useTransferProcessData";
import {Skeleton} from "@/components/ui/skeleton";
import {Status} from "@/features/shared/data";

export default function TransferProcess() {
  const {t} = useTranslation();

  const {
    id,
    info,
    finish,
    user,
    isLoading
  } = useTransferProcessData();
  const navigate = useNavigate();

  // Skeleton component for loading state
  const ProcessSkeleton = () => (
    <div className="grid gap-2" aria-label="Loading...">
      {/* Transfer card skeleton */}
      <Card className="shadow-lg">
        <CardContent className="py-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="pt-2">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-20 mx-auto mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Scanner cards skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
      
      {/* Optional target items link skeleton */}
      <div className="space-y-4 p-2">
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
    </div>
  );

  const isWaitingForApproval = info?.status === Status.WaitingForApproval;
  // For cross-warehouse transfers, we don't need target bins, so consider complete if there are source items
  const sourceWhs = info?.sourceWhsCode || info?.whsCode;
  const isCrossWarehouseTransfer = info?.targetWhsCode && info?.targetWhsCode !== sourceWhs;
  const canFinish = (isCrossWarehouseTransfer ? (info?.progress ?? 0) > 0 : info?.isComplete) && !isWaitingForApproval;

  return (
    <ContentTheme title={t("transfer")} titleOnClick={() => navigate(`/transfer`)}
                  titleBreadcrumbs={[{label: info?.number?.toString() ?? ''}]}
                  footer={
                    <div className="p-4">
                      <Button type="button"
                              className={cn("w-full bg-green-500", canFinish ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed')}
                              onClick={() => finish()}
                              disabled={isLoading || !canFinish}>
                        <Check className="h-6 w-6"/>
                        {t("finish")}
                      </Button>
                    </div>
                  }
    >
      {isLoading ? (
        <ProcessSkeleton />
      ) : id ? (
        <div className="grid gap-2">
          {info && <TransferCard header={false} doc={info}/>}

          {/* Show approval message if status is WaitingForApproval */}
          {info?.status === Status.WaitingForApproval ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-8 w-8 text-orange-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">
                      {t("waitingForApprovalStatus")}
                    </h3>
                    <p className="text-sm text-orange-800 mb-2">
                      {t("transferApprovalRequired")}
                    </p>
                    {info.targetWhsCode && info.sourceWhsCode && (
                      <div className="text-sm text-orange-700 bg-white rounded p-3 mt-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">{t("crossWarehouseTransfer")}</span>
                        </div>
                        <div className="mt-2 ml-6 space-y-1">
                          <div>{t("sourceWarehouse")}: <span className="font-medium">{info.sourceWhsCode}</span></div>
                          <div>{t("targetWarehouse")}: <span className="font-medium">{info.targetWhsCode}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent>
                  <BinLocationScanner label={t("scanTransferSourceBin")}
                                      onScan={(bin) => navigate(`/transfer/${id}/source?bin=${JSON.stringify(bin)}`)}/>
                </CardContent>
              </Card>
              {/* Only show target bin scanner if transfer is within the same warehouse */}
              {!isCrossWarehouseTransfer && (
                <Card>
                  <CardContent>
                    <BinLocationScanner label={t("scanTransferTargetBin")}
                                        autofocus={false}
                                        onScan={(bin) => navigate(`/transfer/${id}/targetBins?bin=${JSON.stringify(bin)}`)}/>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-4 p-2">
                {user?.settings.transferTargetItems && (
                  <Link to={`/transfer/${id}/targetItems`} className="block">
                    <div
                      className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
                      <Map className="h-6 w-6 text-blue-500"/>
                      <span className="text-lg font-semibold">{t("selectTransferTargetItems")}</span>
                    </div>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </ContentTheme>
  );
}
