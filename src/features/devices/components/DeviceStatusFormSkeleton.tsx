import {Skeleton} from "@/components/ui/skeleton";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

interface DeviceStatusFormSkeletonProps {
  open: boolean;
}

export function DeviceStatusFormSkeleton({ open }: DeviceStatusFormSkeletonProps) {
  return (
    <Dialog open={open}>
      <DialogContent aria-label="Loading device status form...">
        <DialogHeader>
          <DialogTitle>
            <Skeleton className="h-5 w-40" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Device Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* New Status Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Reason Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-24 w-full" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}