import {Card, CardContent} from "@/components";
import {AlertCircle, Clock} from "lucide-react";
import {useTranslation} from "react-i18next";
import {TransferDocument} from "@/features/transfer/data/transfer";

interface TransferApprovalMessageProps {
  transfer: TransferDocument;
}

/**
 * Displays a warning message when a transfer is waiting for approval
 * Shows cross-warehouse transfer details if applicable
 */
export const TransferApprovalMessage = ({transfer}: TransferApprovalMessageProps) => {
  const {t} = useTranslation();

  return (
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
            {transfer.targetWhsCode && transfer.sourceWhsCode && (
              <div className="text-sm text-orange-700 bg-white rounded p-3 mt-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4"/>
                  <span className="font-medium">{t("crossWarehouseTransfer")}</span>
                </div>
                <div className="mt-2 ml-6 space-y-1">
                  <div>
                    {t("sourceWarehouse")}: <span className="font-medium">{transfer.sourceWhsCode}</span>
                  </div>
                  <div>
                    {t("targetWarehouse")}: <span className="font-medium">{transfer.targetWhsCode}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
