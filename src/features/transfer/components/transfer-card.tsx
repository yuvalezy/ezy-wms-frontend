import React from "react";
import {useNavigate} from "react-router";
import {useAuth} from "@/components/AppContext";
import {useTranslation} from "react-i18next";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {useDocumentStatusToString} from "@/hooks/useDocumentStatusToString";
import {Status} from "@/features/shared/data/shared";
import {useDateTimeFormat} from "@/hooks/useDateTimeFormat";
import {CheckCircle, XCircle} from "lucide-react";
import {FullInfoBox, InfoBoxValue} from "@/components";
import InfoBox from "@/components/InfoBox";
import {TransferDocument, ApprovalStatus} from "@/features/transfer/data/transfer";
import {RoleType} from "@/features/authorization-groups/data/authorization-group";
import {formatNumber} from "@/utils/number-utils";
import {ObjectAction} from "@/features/packages/types";
import {StatusBadge} from "@/components/ui/status-badge";
import {getApprovalStatusVariant, getApprovalStatusText} from "@/features/transfer/utils/approval-utils";

type TransferCardProps = {
  doc: TransferDocument,
  onAction?: (transfer: TransferDocument, action: ObjectAction) => void,
  supervisor?: boolean,
  approval?: boolean,
  header?: boolean,
  displayProgress?: boolean
}

const TransferCard: React.FC<TransferCardProps> = ({doc, onAction, supervisor = false, approval = false, header = true, displayProgress = true}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {user} = useAuth();
  const {dateFormat, dateTimeFormat} = useDateTimeFormat();

  function handleOpen(transfer: TransferDocument) {
    if (!approval)
      navigate(`/transfer/${transfer.id}`);
    else
      navigate(`/transfer/approve/${transfer.id}`);
  }

  let handleOpenLink = user?.roles?.includes(RoleType.TRANSFER);

  const documentStatusToString = useDocumentStatusToString();
  // For cross-warehouse transfers, show 100% if any source items added (progress > 0)
  const sourceWhs = doc.sourceWhsCode || doc.whsCode;
  const isCrossWarehouseTransfer = doc.targetWhsCode && doc.targetWhsCode !== sourceWhs;
  const progressDisplayValue = isCrossWarehouseTransfer && (doc.lines?.length ?? 0) > 0 ? 100 : (doc.progress ?? 0);

  return (
    <Card key={doc.id} className={header ? "mb-4 shadow-lg" : "shadow-lg"}>
      <CardContent className="py-4">
        <FullInfoBox>
          <InfoBoxValue label={t('number')} value={doc.number}
                        onClick={handleOpenLink ? () => handleOpen(doc) : undefined}/>
          {doc.name && <InfoBoxValue label={t('id')} value={doc.name}/>}
          <InfoBoxValue label={t('docDate')} value={dateFormat(doc.date)}/>
          <InfoBoxValue label={t('createdBy')} value={doc.createdByUser?.fullName}/>
          <InfoBoxValue label={t('status')} value={documentStatusToString(doc.status)}/>
          {doc.sourceWhsCode && <InfoBoxValue label={t('sourceWarehouse')} value={doc.sourceWhsCode}/>}
          {doc.targetWhsCode && <InfoBoxValue label={t('targetWarehouse')} value={doc.targetWhsCode}/>}
        </FullInfoBox>
        {doc.comments &&
            <InfoBox>
                <InfoBoxValue label={t('comment')} value={doc.comments}/>
            </InfoBox>}
        {/* Display approval workflow information if it exists */}
        {doc.approvalWorkflow && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-700">{t('approvalStatus')}:</span>
              <StatusBadge variant={getApprovalStatusVariant(doc.approvalWorkflow.approvalStatus)}>
                {getApprovalStatusText(doc.approvalWorkflow.approvalStatus, t)}
              </StatusBadge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('requestedBy')}:</span>
                <span className="font-medium">{doc.approvalWorkflow.requestedByUser?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('requestedAt')}:</span>
                <span className="font-medium">{dateTimeFormat(doc.approvalWorkflow.requestedAt)}</span>
              </div>
              {doc.approvalWorkflow.reviewedByUser && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{doc.approvalWorkflow.approvalStatus === ApprovalStatus.Approved ? t('approvedBy') : t('reviewedBy')}:</span>
                    <span className="font-medium">{doc.approvalWorkflow.reviewedByUser.fullName}</span>
                  </div>
                  {doc.approvalWorkflow.reviewedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{doc.approvalWorkflow.approvalStatus === ApprovalStatus.Approved ? t('approvedAt') : t('reviewedAt')}:</span>
                      <span className="font-medium">{dateTimeFormat(doc.approvalWorkflow.reviewedAt)}</span>
                    </div>
                  )}
                </>
              )}
              {doc.approvalWorkflow.rejectionReason && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <span className="text-gray-600">{t('rejectionReason')}:</span>
                  <p className="mt-1 text-red-600 font-medium">{doc.approvalWorkflow.rejectionReason}</p>
                </div>
              )}
              {doc.approvalWorkflow.reviewComments && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <span className="text-gray-600">{t('reviewComments')}:</span>
                  <p className="mt-1 text-gray-700">{doc.approvalWorkflow.reviewComments}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {displayProgress && (<ul className="space-y-2 text-sm">
          <li className="pt-2">
            <Progress value={progressDisplayValue} className="w-full"/>
            <p
              className="text-xs text-muted-foreground text-center mt-1">{formatNumber(progressDisplayValue, 0)}% {t('progress')}</p>
          </li>
        </ul>)}
      </CardContent>
      {supervisor && (
        <CardFooter className="flex justify-end space-x-2 pt-4 border-t">
          {doc.status === Status.InProgress && progressDisplayValue === 100 && (
            <Button variant="default" onClick={() => onAction?.(doc, 'approve')}
                    className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle className="mr-2 h-4 w-4"/>{t('finish')}
            </Button>
          )}
          <Button variant="destructive" onClick={() => onAction?.(doc, 'cancel')}>
            <XCircle className="mr-2 h-4 w-4"/>{t('cancel')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default TransferCard;
