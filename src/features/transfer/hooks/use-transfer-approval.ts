import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { transferService } from '@/features/transfer/data/transefer-service';
import { ObjectAction } from '@/features/packages/types';

interface UseTransferApprovalOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function useTransferApproval(options?: UseTransferApprovalOptions) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ObjectAction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionReasonError, setRejectionReasonError] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [selectedTransferNumber, setSelectedTransferNumber] = useState<number | string | undefined>();

  const handleAction = (
    transferId: string,
    transferNumber: number | string | undefined,
    action: ObjectAction
  ) => {
    setSelectedTransferId(transferId);
    setSelectedTransferNumber(transferNumber);
    setActionType(action);
    setRejectionReason('');
    setRejectionReasonError(false);
    setDialogError(null);
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
    if (!selectedTransferId) return;

    // Validate rejection reason on the frontend
    if (actionType === 'reject' && !rejectionReason.trim()) {
      setRejectionReasonError(true);
      return;
    }

    // Clear any previous dialog error
    setDialogError(null);
    setIsProcessing(true);

    try {
      if (actionType === 'approve') {
        await transferService.approveTransfer(selectedTransferId);
        toast.success(t('transferApprovedSuccess'));
      } else {
        await transferService.rejectTransfer(selectedTransferId, rejectionReason);
        toast.success(t('transferRejectedSuccess'));
      }

      // Only close dialog on success
      setDialogOpen(false);

      // Reset state
      setRejectionReason('');
      setSelectedTransferId(null);
      setSelectedTransferNumber(undefined);
      setActionType(null);

      // Call success callback
      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (error: any) {
      // Show error in dialog, don't close it
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'An unexpected error occurred';
      setDialogError(errorMessage);
      setIsProcessing(false);

      // Call error callback
      if (options?.onError) {
        options.onError(error);
      }
      // Don't close dialog, allow retry
    } finally {
      if (actionType === 'approve' || (actionType === 'reject' && !dialogError)) {
        setIsProcessing(false);
      }
    }
  };

  const handleCancelDialog = () => {
    setDialogOpen(false);
    setRejectionReason('');
    setRejectionReasonError(false);
    setDialogError(null);
    setSelectedTransferId(null);
    setSelectedTransferNumber(undefined);
    setActionType(null);
  };

  return {
    // State
    dialogOpen,
    actionType,
    rejectionReason,
    rejectionReasonError,
    dialogError,
    isProcessing,
    selectedTransferNumber,

    // Handlers
    handleAction,
    handleRejectionReasonChange,
    handleConfirmAction,
    handleCancelDialog,
    setDialogOpen,
  };
}