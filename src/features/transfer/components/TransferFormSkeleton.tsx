import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const TransferFormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-4 border rounded-lg shadow" aria-label="Loading transfer form...">
      {/* Document ID Field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Comments Field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-20 w-full" />
      </div>
      
      {/* Create Button */}
      <div>
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
};