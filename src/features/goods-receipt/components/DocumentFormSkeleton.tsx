import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';
import {Card} from '@/components/ui/card';

interface DocumentFormSkeletonProps {
  showTabs?: boolean;
}

export const DocumentFormSkeleton: React.FC<DocumentFormSkeletonProps> = ({ 
  showTabs = true 
}) => {
  return (
    <div className="w-full" aria-label="Loading document form...">
      {showTabs && (
        // Tabs skeleton
        <div className="grid w-full grid-cols-2 mb-4">
          <Skeleton className="h-10 rounded-r-none" />
          <Skeleton className="h-10 rounded-l-none" />
        </div>
      )}
      
      {!showTabs ? (
        // Simple card layout for non-regular process types
        <Card className="mb-4 shadow-lg">
          <div className="space-y-4 p-4">
            {/* Document ID field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            {/* Document list */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="border rounded-lg p-4 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
            
            {/* Create button */}
            <div>
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </Card>
      ) : (
        // Tabbed form layout
        <div className="space-y-4 p-4">
          {/* Document ID field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Conditional content based on tab */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Document list area (for specific orders tab) */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="border rounded-lg p-4 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
          
          {/* Create button */}
          <div>
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      )}
    </div>
  );
};