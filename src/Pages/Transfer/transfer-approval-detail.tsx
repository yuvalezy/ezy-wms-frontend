import ContentTheme from "@/components/ContentTheme";
import {useNavigate, useParams} from "react-router";
import {Card, CardContent, useAuth, useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import TransferCard from "@/features/transfer/components/transfer-card";
import {useEffect, useState} from "react";
import {SourceTarget, TransferContent, TransferDocument} from "@/features/transfer/data/transfer";
import {TransferApprovalDetailSkeleton} from "@/features/transfer/components/transfer-approval-detail-skeleton";
import {transferService} from "@/features/transfer/data/transefer-service";
import {formatStock} from "@/features/items/utils/stock-calculations";
import {Status, UnitType} from "@/features/shared/data";
import {TransferApprovalDialog} from "@/features/transfer/components/transfer-approval-dialog";
import {ApprovalActionButtons} from "@/features/transfer/components/approval-action-buttons";
import {useTransferApproval} from "@/features/transfer/hooks/use-transfer-approval";
import {ObjectAction} from "@/features/packages/types";

export default function TransferApprovalDetail() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  const {setError} = useThemeContext();
  const {user, unitSelection, defaultUnit} = useAuth();

  const [transfer, setTransfer] = useState<TransferDocument | null>(null);
  const [content, setContent] = useState<TransferContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const settings = user?.settings;

  const {
    dialogOpen,
    actionType,
    rejectionReason,
    rejectionReasonError,
    dialogError,
    isProcessing,
    selectedTransferNumber,
    handleAction,
    handleRejectionReasonChange,
    handleConfirmAction,
    handleCancelDialog,
    setDialogOpen,
  } = useTransferApproval({
    onSuccess: () => {
      // Navigate back to approval list
      navigate('/transfer/approve');
    }
  });

  useEffect(() => {
    if (id) {
      fetchTransferDetails();
    }
  }, [id]);

  const fetchTransferDetails = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // Fetch both transfer header and content in parallel
      const [transferData, transferContent] = await Promise.all([
        transferService.getById(id),
        transferService.fetchContent({
          id,
          type: SourceTarget.Source
        })
      ]);

      setTransfer(transferData);

      // Group by item code and sum quantities
      const groupedContent = transferContent.reduce((acc, item) => {
        const existing = acc.find(i => i.itemCode === item.itemCode);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          acc.push({...item});
        }
        return acc;
      }, [] as TransferContent[]);

      setContent(groupedContent);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferAction = (action: ObjectAction) => {
    if (id) {
      handleAction(id, transfer?.number, action);
    }
  };

  const formatQuantity = (item: TransferContent): string => {
    if (!unitSelection) {
      switch (defaultUnit) {
        case UnitType.Unit:
          return `${item.quantity} ${t('units')}`;
        case UnitType.Dozen:
          return `${item.quantity / item.numInBuy} ${t('units')}`;
        case UnitType.Pack:
          return `${item.quantity / item.numInBuy / item.purPackUn} ${t('units')}`;
      }
    }

    return formatStock(
      {
        quantity: item.quantity,
        numInBuy: item.numInBuy,
        purPackUn: item.purPackUn,
        purPackMsr: item.purPackMsr,
        buyUnitMsr: item.buyUnitMsr
      },
      settings!,
      unitSelection,
      defaultUnit,
      t
    );
  };

  return (
    <ContentTheme
      title={t("transferApprovals")}
      titleOnClick={() => navigate('/transfer/approve')}
      titleBreadcrumbs={transfer ? [{label: transfer.number?.toString() ?? ''}] : []}
      footer={
        !isLoading && transfer && transfer.status === Status.WaitingForApproval && (
          <div className="p-4">
            <ApprovalActionButtons
              onApprove={() => handleTransferAction('approve')}
              onReject={() => handleTransferAction('reject')}
              isProcessing={isProcessing}
            />
          </div>
        )
      }
    >
      {isLoading ? (
        <TransferApprovalDetailSkeleton/>
      ) : transfer ? (
        <div className="grid gap-4">
          {/* Transfer header card */}
          <TransferCard header={false} doc={transfer} displayProgress={false}/>

          {/* Transfer content */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t("transferItems")}</h3>

              {content.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('noItemsFound')}
                </div>
              ) : (
                <div className="space-y-4">
                  {content.map((item, index) => (
                    <div
                      key={`${item.itemCode}-${index}`}
                      className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.itemCode}</p>
                          <p className="text-sm text-gray-600">{item.itemName}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-500">{t('quantity')}:</span>
                        <span className="font-medium text-gray-900">
                          {formatQuantity(item)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t('transferNotFound')}
        </div>
      )}

      <TransferApprovalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionType={actionType}
        transferNumber={transfer?.number}
        rejectionReason={rejectionReason}
        onReasonChange={handleRejectionReasonChange}
        rejectionReasonError={rejectionReasonError}
        dialogError={dialogError}
        isProcessing={isProcessing}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelDialog}
      />
    </ContentTheme>
  );
}
