import ContentTheme from "@/components/ContentTheme";
import {useNavigate, useParams} from "react-router";
import {Button, Card, CardContent, useAuth, useThemeContext} from "@/components";
import {useTranslation} from "react-i18next";
import {Check, Loader2, X} from 'lucide-react';
import TransferCard from "@/features/transfer/components/transfer-card";
import {useEffect, useState} from "react";
import {SourceTarget, TransferContent, TransferDocument} from "@/features/transfer/data/transfer";
import {TransferApprovalDetailSkeleton} from "@/features/transfer/components/transfer-approval-detail-skeleton";
import {transferService} from "@/features/transfer/data/transefer-service";
import {AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "@/components/ui/alert-dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import {StringFormat} from "@/utils/string-utils";
import {formatStock} from "@/features/items/utils/stock-calculations";
import {Status, UnitType} from "@/features/shared/data";

export default function TransferApprovalDetail() {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {id} = useParams<{id: string}>();
  const {setError} = useThemeContext();
  const {user, unitSelection, defaultUnit} = useAuth();

  const [transfer, setTransfer] = useState<TransferDocument | null>(null);
  const [content, setContent] = useState<TransferContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState(false);

  const settings = user?.settings;

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

  const handleAction = (action: 'approve' | 'reject') => {
    setActionType(action);
    setRejectionReason("");
    setRejectionReasonError(false);
    setDialogOpen(true);
  };

  const handleRejectionReasonChange = (value: string) => {
    setRejectionReason(value);
    // Clear error when user starts typing
    if (value.trim()) {
      setRejectionReasonError(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!transfer || !id) return;

    // Validate rejection reason on the frontend
    if (actionType === 'reject' && !rejectionReason.trim()) {
      setRejectionReasonError(true);
      return;
    }

    setDialogOpen(false);
    setIsProcessing(true);

    try {
      if (actionType === 'approve') {
        await transferService.approveTransfer(id);
        toast.success(t("transferApprovedSuccess"));
      } else {
        await transferService.rejectTransfer(id, rejectionReason);
        toast.success(t("transferRejectedSuccess"));
      }

      // Navigate back to approval list
      navigate('/transfer/approve');
    } catch (error) {
      setError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelDialog = () => {
    setDialogOpen(false);
    setRejectionReason("");
    setRejectionReasonError(false);
    setActionType(null);
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
          <div className="p-4 flex gap-2">
            <Button
              type="button"
              className="flex-1 bg-green-500 hover:bg-green-600"
              onClick={() => handleAction('approve')}
              disabled={isProcessing}
            >
              <Check className="h-5 w-5 mr-2"/>
              {t("approve")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={() => handleAction('reject')}
              disabled={isProcessing}
            >
              <X className="h-5 w-5 mr-2"/>
              {t("reject")}
            </Button>
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

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500"/>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('processing')}</p>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmAction")}</AlertDialogTitle>
            <AlertDialogDescription>
              {StringFormat(
                actionType === "approve"
                  ? t("confirmApproveTransfer")
                  : t("confirmRejectTransfer"),
                transfer?.number
              )}
              <br/> {t('actionCannotReverse')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionType === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">{t('rejectionReason')}</Label>
              <Textarea
                id="rejectionReason"
                placeholder={t('enterRejectionReason')}
                value={rejectionReason}
                onChange={(e) => handleRejectionReasonChange(e.target.value)}
                className={`min-h-[100px] ${rejectionReasonError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              {rejectionReasonError && (
                <p className="text-sm text-red-500">{t('reasonRequired')}</p>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <Button variant="outline" onClick={handleCancelDialog}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={actionType === 'reject' && !rejectionReason.trim()}
            >
              {t("accept")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentTheme>
  );
}
