import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';

export const ProcessSkeleton = () => (
  <div className="space-y-4" aria-label="Loading...">
    {/* Document Info Skeleton */}
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>

    {/* Process Alerts Skeleton */}
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="p-4 border rounded-lg">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
    ))}

    {/* Process Controls Skeleton */}
    <div className="p-4 border rounded-lg">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  </div>
);