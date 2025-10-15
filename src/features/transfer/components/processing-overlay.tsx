import {Loader2} from "lucide-react";
import {useTranslation} from "react-i18next";

interface ProcessingOverlayProps {
  message?: string;
}

export const ProcessingOverlay = ({message}: ProcessingOverlayProps) => {
  const {t} = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500"/>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {message ?? t('processingItem')}
        </p>
      </div>
    </div>
  );
};
