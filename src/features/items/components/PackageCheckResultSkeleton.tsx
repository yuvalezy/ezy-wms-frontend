import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';
import {Card} from '@/components/ui/card';

export const PackageCheckResultSkeleton: React.FC = () => {
  return (
    <div className="space-y-4" aria-label="Loading...">
      {/* Package Information Card Skeleton */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-64 mb-2" />
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </Card>

      {/* Package Metadata Skeleton */}
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Package Contents Skeleton */}
      <Card className="p-0 gap-0">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${i !== 0 ? 'border-t' : ''}`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-48 mt-1" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
              
              {/* Unit Indicators Skeleton */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-8 mt-1" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-8 mt-1" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-8 mt-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Skeleton className="w-6 h-6" />
            </div>
            <Skeleton className="h-8 w-8 mx-auto mb-2" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </Card>
        ))}
      </div>
    </div>
  );
};