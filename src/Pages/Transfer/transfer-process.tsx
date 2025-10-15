import ContentTheme from "@/components/ContentTheme";
import {Link, useNavigate} from "react-router";
import {Button, Card, CardContent} from "@/components";
import {useTranslation} from "react-i18next";
import {Check, Map} from 'lucide-react';
import BinLocationScanner from "@/components/BinLocationScanner";
import TransferCard from "@/features/transfer/components/transfer-card";
import {cn} from "@/utils/css-utils";
import {Status} from "@/features/shared/data";
import {useTransferProcess} from "@/features/transfer/context/TransferProcessContext";
import {TransferProcessSkeleton} from "@/features/transfer/components/transfer-process-skeleton";
import {isCrossWarehouseTransfer, canFinishTransfer} from "@/features/transfer/utils/transfer-utils";
import {TransferApprovalMessage} from "@/features/transfer/components/transfer-approval-message";

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
    if (!info || info.status !== Status.Open && info.status !== Status.InProgress)
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
            <TransferApprovalMessage transfer={info} />
          ) : info && (info.status === Status.Open || info.status === Status.InProgress) && (
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
