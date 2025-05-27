import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Button, ButtonProps} from "@/components/ui/button";
import { Info, AlertTriangle, CheckCircle, XCircle, HelpCircle, ShieldAlert } from "lucide-react"; // Assuming lucide-react is used

type MessageBoxType = "info" | "warning" | "success" | "error" | "confirm" | "alert";

interface MessageBoxProps {
  trigger?: React.ReactNode; // Optional trigger element
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  type?: MessageBoxType;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  hideCancel?: boolean;
  confirmButtonVariant?: ButtonProps["variant"];
  customActions?: React.ReactNode; // For more complex scenarios like "Error with custom action"
}

const MessageBoxIcon = ({ type }: { type?: MessageBoxType }) => {
  switch (type) {
    case "info":
      return <Info className="h-6 w-6 text-blue-500" />;
    case "warning":
      return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    case "success":
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case "error":
      return <XCircle className="h-6 w-6 text-red-500" />;
    case "confirm":
      return <HelpCircle className="h-6 w-6 text-gray-500" />;
    case "alert":
      return <ShieldAlert className="h-6 w-6 text-orange-500" />;
    default:
      return null;
  }
};

const MessageBox = React.forwardRef<
  React.ElementRef<typeof AlertDialogContent>,
  MessageBoxProps
>(
  (
    {
      trigger,
      open,
      onOpenChange,
      type = "info",
      title,
      description,
      confirmText = "OK",
      cancelText = "Cancel",
      onConfirm,
      onCancel,
      hideCancel = false,
      confirmButtonVariant = "default",
      customActions,
    },
    ref
  ) => {
    const handleConfirm = () => {
      if (onConfirm) {
        onConfirm();
      }
    };

    const handleCancel = () => {
      if (onCancel) {
        onCancel();
      }
    };

    const content = (
      <AlertDialogContent ref={ref}>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <MessageBoxIcon type={type} />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <AlertDialogFooter>
          {customActions ? (
            customActions
          ) : (
            <>
              {!hideCancel && (
                <AlertDialogCancel onClick={handleCancel} asChild>
                  <Button variant="outline">{cancelText}</Button>
                </AlertDialogCancel>
              )}
              <AlertDialogAction onClick={handleConfirm} asChild>
                <Button variant={confirmButtonVariant}>{confirmText}</Button>
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    );

    if (trigger) {
      return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
          <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
          {content}
        </AlertDialog>
      );
    }

    // For controlled dialog without a trigger
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {open && content}
      </AlertDialog>
    );
  }
);

MessageBox.displayName = "MessageBox";

export { MessageBox, type MessageBoxProps, type MessageBoxType };
