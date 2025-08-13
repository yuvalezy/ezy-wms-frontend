import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProcessCancelSkeletonProps {
  showSupervisorField?: boolean;
}

const ProcessCancelSkeleton: React.FC<ProcessCancelSkeletonProps> = ({ 
  showSupervisorField = false 
}) => {
  return (
    <div className="space-y-4" aria-label="Loading cancel form...">
      {/* Comment Field */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-16 w-full rounded" />
      </div>
      
      {/* Supervisor Password Field (conditional) */}
      {showSupervisorField && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      )}
      
      {/* Reason Dropdown */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-full" />
      </div>
      
      {/* Footer Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  );
};

export default ProcessCancelSkeleton;