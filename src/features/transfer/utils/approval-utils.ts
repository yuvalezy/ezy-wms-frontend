import {ApprovalStatus} from "@/features/transfer/data/transfer";
import {StatusVariant} from "@/components/ui/status-badge";
import {TFunction} from "i18next";

/**
 * Utility functions for approval workflow operations
 * Follows DRY principle by centralizing approval status logic
 */

/**
 * Maps ApprovalStatus enum to StatusBadge variant
 * @param status - The approval status
 * @returns The corresponding status badge variant
 */
export const getApprovalStatusVariant = (status?: ApprovalStatus): StatusVariant => {
  switch (status) {
    case ApprovalStatus.Approved:
      return 'success';
    case ApprovalStatus.Rejected:
      return 'error';
    case ApprovalStatus.Pending:
      return 'warning';
    case ApprovalStatus.Cancelled:
      return 'cancelled';
    default:
      return 'default';
  }
};

/**
 * Maps ApprovalStatus enum to localized text
 * @param status - The approval status
 * @param t - The translation function
 * @returns The localized status text
 */
export const getApprovalStatusText = (status: ApprovalStatus | undefined, t: TFunction): string => {
  switch (status) {
    case ApprovalStatus.Approved:
      return t('approved');
    case ApprovalStatus.Rejected:
      return t('rejected');
    case ApprovalStatus.Pending:
      return t('pendingApproval');
    case ApprovalStatus.Cancelled:
      return t('cancelled');
    default:
      return '';
  }
};
