import ContentTheme from "@/components/ContentTheme";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {Button, Card, CardContent} from "@/components";
import {useTranslation} from "react-i18next";
import {Map, Check} from 'lucide-react';
import BinLocationScanner from "@/components/BinLocationScanner";
import TransferCard from "@/features/transfer/components/transfer-card";
import {cn} from "@/lib/utils";
import {useTransferProcessData} from "@/features/transfer/hooks/useTransferProcessData";

export default function TransferProcess() {
  const {t} = useTranslation();

  const {
    id,
    info,
    finish,
    user
  } = useTransferProcessData();
  const navigate = useNavigate();

  return (
    <ContentTheme title={t("transfer")} titleOnClick={() => navigate(`/transfer`)}
                  titleBreadcrumbs={[{label: info?.number?.toString() ?? ''}]}
                  footer={
                    <div className="p-4">
                      <Button type="button"
                              className={cn("w-full bg-green-500", info?.isComplete ? 'hover:shadow-lg cursor-pointer' : 'opacity-50 cursor-not-allowed')}
                              onClick={() => finish()}>
                        <Check className="h-6 w-6"/>
                        {t("finish")}
                      </Button>
                    </div>
                  }
    >
      {id && (
        <div className="grid gap-2">
          {info && <TransferCard header={false} doc={info}/>}
          <Card>
            <CardContent>
              <BinLocationScanner label={t("scanTransferSourceBin")}
                                  onScan={(bin) => navigate(`/transfer/${id}/source?bin=${JSON.stringify(bin)}`)}/>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <BinLocationScanner label={t("scanTransferTargetBin")}
                                  autofocus={false}
                                  onScan={(bin) => navigate(`/transfer/${id}/targetBins?bin=${JSON.stringify(bin)}`)}/>
            </CardContent>
          </Card>
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
        </div>
      )}
    </ContentTheme>
  );
}
