import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';

interface DeviceStatusBannerSkeletonProps {
  showDialog?: boolean;
}

const DeviceStatusBannerSkeleton: React.FC<DeviceStatusBannerSkeletonProps> = ({ showDialog = false }) => {
  return (
    <>
      {/* Banner Skeleton */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg w-full" aria-label="Loading...">
        <div className="flex items-center">
          <Skeleton className="h-5 w-5 mr-3 rounded" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Dialog Skeleton */}
      {showDialog && (
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Skeleton className="h-6 w-32" />
              </DialogTitle>
              <DialogDescription>
                <Skeleton className="h-4 w-64" />
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4" aria-label="Loading form...">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-20 w-full rounded" />
              </div>
            </div>

            <DialogFooter>
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DeviceStatusBannerSkeleton;