import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StringFormat } from "@/utils/string-utils";

import { ObjectAction } from "@/features/packages/types";

interface TransferApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: ObjectAction | null;
  transferNumber?: number | string;
  rejectionReason: string;
  onReasonChange: (value: string) => void;
  rejectionReasonError: boolean;
  dialogError: string | null;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TransferApprovalDialog: React.FC<TransferApprovalDialogProps> = ({
  open,
  onOpenChange,
  actionType,
  transferNumber,
  rejectionReason,
  onReasonChange,
  rejectionReasonError,
  dialogError,
  isProcessing,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirmAction")}</AlertDialogTitle>
          <AlertDialogDescription>
            {StringFormat(
              actionType === "approve"
                ? t("confirmApproveTransfer")
                : t("confirmRejectTransfer"),
              transferNumber
            )}
            <br /> {t("actionCannotReverse")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Show error message if there's one */}
        {dialogError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
            {dialogError}
          </div>
        )}

        {actionType === "reject" && (
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">{t("rejectionReason")}</Label>
            <Textarea
              id="rejectionReason"
              placeholder={t("enterRejectionReason")}
              value={rejectionReason}
              onChange={(e) => onReasonChange(e.target.value)}
              autoFocus
              className={`min-h-[100px] ${
                rejectionReasonError
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
            />
            {rejectionReasonError && (
              <p className="text-sm text-red-500">{t("reasonRequired")}</p>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={
              (actionType === "reject" && !rejectionReason.trim()) ||
              isProcessing
            }
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("processing")}
              </>
            ) : (
              t("accept")
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};