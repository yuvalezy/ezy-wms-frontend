import React from "react";
import { useNavigate } from "react-router";
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
  showViewButton?: boolean;
}

export const PickingCheckButton: React.FC<PickingCheckButtonProps> = ({
  picking,
  progressValue,
  onStartCheck,
  size = "sm",
  variant = "outline",
  className = "",
  showViewButton = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // If check has already started, show navigation button with info color
  if (picking.checkStarted) {
    return (
      <Button
        type="button"
        variant="secondary"
        size={size}
        className={`${className} bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300`}
        onClick={() => navigate(`/pick/${picking.entry}/check`)}
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        {t("viewCheck")}
      </Button>
    );
  }

  // If check hasn't started, show start/restart button
  const buttonText = picking.hasCheck ? "restartCheck" : "startCheck";
  const isRestart = picking.hasCheck;

  // For cases where we need both buttons (like in mobile view)
  if (picking.hasCheck && showViewButton) {
    return (
      <>
        <Button
          type="button"
          variant="secondary"
          size={size}
          className={`${className} bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300`}
          disabled={progressValue === 0}
          onClick={() => onStartCheck?.(picking)}
        >
          <CheckCircle className="mr-2 h-4 w-4"/>
          {t(buttonText)}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size={size}
          className={`${className} bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300`}
          onClick={() => navigate(`/pick/${picking.entry}/check`)}
        >
          <Eye className="mr-2 h-4 w-4"/>
          {t("viewCheck")}
        </Button>
      </>
    );
  }

  // Single button case
  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      className={`${className} ${
        isRestart 
          ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300' 
          : 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300'
      }`}
      disabled={progressValue === 0}
      onClick={() => onStartCheck?.(picking)}
    >
      <CheckCircle className="mr-2 h-4 w-4"/>
      {t(buttonText)}
    </Button>
  );
};