import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {CheckCircle, Eye} from "lucide-react";
import { PickingDocument } from "@/features/picking/data/picking";

interface PickingCheckButtonProps {
  picking: PickingDocument;
  progressValue: number;
  onStartCheck?: (picking: PickingDocument) => void;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export const PickingCheckButton: React.FC<PickingCheckButtonProps> = ({
  picking,
  progressValue,
  onStartCheck,
  size = "sm",
  variant = "outline",
  className = "cursor-pointer mr-2"
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // If check has already started, show navigation button
  if (picking.checkStarted) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => navigate(`/pick/${picking.entry}/check`)}
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        {t("checkStarted")}
      </Button>
    );
  }

  // If check hasn't started, show start/restart button
  const buttonText = picking.hasCheck ? "restartCheck" : "startCheck";

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={progressValue === 0}
        onClick={() => onStartCheck?.(picking)}
      >
        <CheckCircle className="mr-2 h-4 w-4"/>
        {t(buttonText)}
      </Button>
      {picking.hasCheck && (
        <Button
          type="button"
          variant={variant}
          size={size}
          className={className}
          onClick={() => navigate(`/pick/${picking.entry}/check`)}
        >
          <Eye className="mr-2 h-4 w-4"/>
          {t("viewCheck")}
        </Button>
      )}
    </div>
  );
};