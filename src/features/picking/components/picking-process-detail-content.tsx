import React, {useEffect, useState} from "react";
import {PickingDocumentDetailItem} from "@/features/picking/data/picking";
import {PickingProcessDetailContentBins} from "@/features/picking/components/picking-process-detail-content-bins";
import {
  PickingProcessDetailContentAvailable
} from "@/features/picking/components/picking-process-detail-content-available";
import {Skeleton} from "@/components/ui/skeleton";

export interface PickingProcessDetailContentProps {
  items?: PickingDocumentDetailItem[];
  isLoading?: boolean;
}

export const PickingProcessDetailContent: React.FC<PickingProcessDetailContentProps> = ({items, isLoading = false}) => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(items?.some(i => i.available != null && i.available > 0) ?? false);
  }, [items]);

  // Skeleton component for detail content
  const DetailContentSkeleton = () => (
    <div className="space-y-4" aria-label="Loading...">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="contentStyle">
      {isLoading ? (
        <DetailContentSkeleton />
      ) : (
        !available ? <PickingProcessDetailContentBins items={items} />:
         <PickingProcessDetailContentAvailable items={items} />
      )}
    </div>
  )
}

export default PickingProcessDetailContent;
