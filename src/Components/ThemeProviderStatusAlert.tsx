import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, CheckCircle, XCircle, X } from "lucide-react";

// Assuming MessageStripDesign was from UI5, let's define a similar type
// or adapt to what shadcn/ui Alert variants might offer.
// For now, we'll keep a similar structure and map it.
export enum StatusAlertType {
  Information = "Information",
  Positive = "Positive",
  Negative = "Negative",
  Warning = "Warning",
}

export type StatusAlert = {
  message: string;
  title?: string; // Optional title
  type?: StatusAlertType;
};

export interface StatusAlertProps {
  alert: StatusAlert;
  onClose: () => void;
}

const StatusAlertIcon = ({ type }: { type?: StatusAlertType }) => {
  switch (type) {
    case StatusAlertType.Information:
      return <Info className="h-5 w-5 text-blue-500" />;
    case StatusAlertType.Positive:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case StatusAlertType.Negative:
      return <XCircle className="h-5 w-5" />; // Destructive variant will color this
    case StatusAlertType.Warning:
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

const ThemeProviderStatusAlert: React.FC<StatusAlertProps> = ({ alert, onClose }) => {
  if (!alert.message) return null;

  const getVariant = (): "default" | "destructive" => {
    switch (alert.type) {
      case StatusAlertType.Negative:
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[1000] w-auto max-w-md">
      <Alert variant={getVariant()} className="relative pr-12"> {/* Added pr-12 for close button spacing */}
        <div className="flex items-start space-x-2">
          <StatusAlertIcon type={alert.type} />
          <div className="flex-grow">
            {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
            <AlertDescription>{alert.message}</AlertDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6" // Position close button
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </Alert>
    </div>
  );
};

export default ThemeProviderStatusAlert;
