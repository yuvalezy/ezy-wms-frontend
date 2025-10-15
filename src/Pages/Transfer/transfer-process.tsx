import ContentTheme from "@/components/ContentTheme";
import {Link, useNavigate} from "react-router";
import {Button, Card, CardContent} from "@/components";
import {useTranslation} from "react-i18next";
import {AlertCircle, Check, Clock, Map} from 'lucide-react';
import BinLocationScanner from "@/components/BinLocationScanner";
import TransferCard from "@/features/transfer/components/transfer-card";
import {cn} from "@/utils/css-utils";
import {Status} from "@/features/shared/data";
import {useTransferProcess} from "@/features/transfer/context/TransferProcessContext";
import {TransferProcessSkeleton} from "@/features/transfer/components/transfer-process-skeleton";
import {isCrossWarehouseTransfer, canFinishTransfer} from "@/features/transfer/utils/transfer-utils";

export default function TransferProcess() {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const {
    id,
    info,
    finish,
    user,
    isLoading
  } = useTransferProcess();

  const isWaitingForApproval = info?.status === Status.WaitingForApproval;
  const crossWarehouse = isCrossWarehouseTransfer(info);
  const canFinish = canFinishTransfer(info, isWaitingForApproval);

  const finishButton = () => {
    if (!info || info.status !== Status.Open)
      return null;

    return <div className="p-4">
      <Button type="button"
              className={cn("w-full bg-green-500", canFinish ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed')}
              onClick={() => finish()}
              disabled={isLoading || !canFinish}>
        <Check className="h-6 w-6"/>
        {t("finish")}
      </Button>
    </div>;
  }

  return (
    <ContentTheme title={t("transfer")} titleOnClick={() => navigate(`/transfer`)}
                  titleBreadcrumbs={[{label: info?.number?.toString() ?? ''}]}
                  footer={finishButton()}
    >
      {isLoading ? (
        <TransferProcessSkeleton/>
      ) : id ? (
        <div className="grid gap-2">
          {info && <TransferCard header={false} doc={info}/>}

          {/* Show approval message if status is WaitingForApproval */}
          {info?.status === Status.WaitingForApproval ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-8 w-8 text-orange-600 flex-shrink-0 mt-1"/>
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
                          <AlertCircle className="h-4 w-4"/>
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
          ) : info && info.status === Status.Open && (
            <>
              {user?.binLocations ? (
                <Card>
                  <CardContent>
                    <BinLocationScanner label={t("scanTransferSourceBin")}
                                        onScan={(bin) => navigate(`/transfer/${id}/source?bin=${JSON.stringify(bin)}`)}/>
                  </CardContent>
                </Card>
              ) : (
                <Button type="button" variant="default" onClick={() => navigate(`/transfer/${id}/source`)}>{t("selectSourceItems")}</Button>
              )}
              {/* Only show target bin scanner if transfer is within the same warehouse */}
              {!crossWarehouse && (
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
