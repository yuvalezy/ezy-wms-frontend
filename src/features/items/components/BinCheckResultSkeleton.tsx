import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const BinCheckResultSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 px-3 pt-3 md:px-0 md:pt-0" aria-label="Loading...">
      {/* Bin Content Items Skeleton */}
      <Card className="p-0 gap-0">
        {[...Array(3)].map((_, index) => (
          <div key={index} className={`${index !== 0 ? 'border-t' : ''}`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="mt-1">
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="mt-1">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              
              {/* Unit Indicators Skeleton */}
              <div className="flex items-center gap-2 mr-2">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 w-3 mt-1" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 w-3 mt-1" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 w-3 mt-1" />
                </div>
              </div>
              
              <Skeleton className="w-5 h-5 rounded" />
            </div>
          </div>
        ))}
      </Card>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Skeleton className="w-6 h-6 rounded" />
            </div>
            <Skeleton className="h-8 w-8 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </Card>
        ))}
      </div>
    </div>
  );
};