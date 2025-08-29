import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';

const ProcessCommentSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 py-4" aria-label="Loading comment form...">
      {/* Comment Label and Textarea */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-24 w-full rounded" />
      </div>
      
      {/* Footer Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  );
};

export default ProcessCommentSkeleton;