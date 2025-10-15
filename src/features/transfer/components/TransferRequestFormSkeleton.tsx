import {Skeleton} from "@/components/ui/skeleton";
import {Card} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";

export function TransferRequestFormSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading transfer request form...">
      {/* Items Table Skeleton */}
      <ScrollArea className="h-64 w-full rounded-md border">
        <div className="p-4">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_2fr_100px_60px] gap-4 pb-3 border-b">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <div></div>
          </div>
          
          {/* Table Rows */}
          {[...Array(3)].map((_, index) => (
            <div key={index} className="grid grid-cols-[1fr_2fr_100px_60px] gap-4 py-3 border-b last:border-b-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-8 rounded-sm" />
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Create Button Skeleton */}
      <div className="text-center">
        <Skeleton className="h-10 w-24 mx-auto" />
      </div>

      {/* Barcode Scanner Skeleton */}
      <Card className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </Card>
    </div>
  );
}