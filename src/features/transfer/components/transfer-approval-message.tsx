import {Card, CardContent} from "@/components";
import {AlertCircle, Clock} from "lucide-react";
import {useTranslation} from "react-i18next";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {StatusBadge} from "@/components/ui/status-badge";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {getApprovalStatusVariant, getApprovalStatusText} from "@/features/transfer/utils/approval-utils";

interface TransferApprovalMessageProps {
  transfer: TransferDocument;
}

/**
 * Displays a warning message when a transfer is waiting for approval
 * Shows cross-warehouse transfer details if applicable
 * Shows approval workflow information if available
 */
export const TransferApprovalMessage = ({transfer}: TransferApprovalMessageProps) => {
  const {t} = useTranslation();
  const {dateTimeFormat} = useDateTimeFormat();

  const approvalWorkflow = transfer.approvalWorkflow;

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

            {/* Display approval workflow details if available */}
            {approvalWorkflow && (
              <div className="text-sm bg-white rounded p-4 mt-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-gray-700">{t('approvalStatus')}:</span>
                  <StatusBadge variant={getApprovalStatusVariant(approvalWorkflow.approvalStatus)}>
                    {getApprovalStatusText(approvalWorkflow.approvalStatus, t)}
                  </StatusBadge>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('requestedBy')}:</span>
                    <span className="font-medium">{approvalWorkflow.requestedByUser?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('requestedAt')}:</span>
                    <span className="font-medium">{dateTimeFormat(approvalWorkflow.requestedAt)}</span>
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
