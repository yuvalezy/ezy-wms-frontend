import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TransferProcessTargetItemsSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading transfer target items...">
      {/* Table Container */}
      <div className="rounded-md border">
        <div className="p-4">
          {/* Table Header */}
          <div className="grid grid-cols-[100px_1fr_2fr_120px] gap-4 pb-3 border-b">
            <div></div> {/* Empty for button column */}
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <div className="text-right">
              <Skeleton className="h-4 w-24 ml-auto" />
            </div>
          </div>
          
          {/* Table Rows with Progress Bars */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-2 py-3 border-b last:border-b-0">
              {/* Main Row */}
              <div className="grid grid-cols-[100px_1fr_2fr_120px] gap-4 items-center">
                <Skeleton className="h-8 w-20" /> {/* Select Button */}
                <Skeleton className="h-4 w-16" /> {/* Code */}
                <Skeleton className="h-4 w-32" /> {/* Description */}
                <div className="text-right">
                  <Skeleton className="h-4 w-12 ml-auto" /> {/* Open Quantity */}
                </div>
              </div>
              
              {/* Progress Row */}
              <div className="px-4">
                <Skeleton className="h-2 w-full" /> {/* Progress Bar */}
                <div className="text-center mt-1">
                  <Skeleton className="h-3 w-8 mx-auto" /> {/* Progress Percentage */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}