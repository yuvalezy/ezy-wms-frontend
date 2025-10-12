import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionErrorProps {
  onRetry: () => void;
  retryText?: string;
  errorTitle?: string;
  errorMessage?: string;
}

export function ConnectionError({
  onRetry,
  retryText = 'Retry',
  errorTitle = 'Connection Error',
  errorMessage = 'Cannot establish connection to server'
}: ConnectionErrorProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-red-100 p-4 mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {errorTitle}
          </h2>

          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>

          <Button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            {retryText}
          </Button>
        </div>
      </div>
    </div>
  );
}