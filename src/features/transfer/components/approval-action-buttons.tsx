import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ApprovalActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  isProcessing?: boolean;
  className?: string;
}

export const ApprovalActionButtons: React.FC<ApprovalActionButtonsProps> = ({
  onApprove,
  onReject,
  isProcessing = false,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        type="button"
        className="flex-1 bg-green-500 hover:bg-green-600"
        onClick={onApprove}
        disabled={isProcessing}
      >
        <Check className="h-5 w-5 mr-2" />
        {t("approve")}
      </Button>
      <Button
        type="button"
        variant="destructive"
        className="flex-1"
        onClick={onReject}
        disabled={isProcessing}
      >
        <X className="h-5 w-5 mr-2" />
        {t("reject")}
      </Button>
    </div>
  );
};