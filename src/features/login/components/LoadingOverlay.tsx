import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  loadingText?: string;
}

export function LoadingOverlay({ loadingText = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl z-10">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-sm text-gray-600">{loadingText}</p>
      </div>
    </div>
  );
}