import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';

export const PackageCheckFormSkeleton: React.FC = () => {
  return (
    <div className="flex justify-center px-3 pt-3 md:px-0 md:pt-0" aria-label="Loading...">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};