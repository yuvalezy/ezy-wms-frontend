import React from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

export const OfflineOverlay: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-lg">
        <WifiOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {t('offlineTitle')}
        </h2>
        <p className="text-gray-600">
          {t('offlineMessage')}
        </p>
      </div>
    </div>
  );
};