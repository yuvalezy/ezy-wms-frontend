import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TransferProcessTargetItemSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading transfer target item processing...">
      {/* Item Information Card */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" /> {/* "Item:" label */}
            <Skeleton className="h-5 w-32" /> {/* Item code */}
            <Skeleton className="h-4 w-1" /> {/* Dash */}
            <Skeleton className="h-5 w-48" /> {/* Item name */}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-16" /> {/* "Quantity:" label */}
            <Skeleton className="h-4 w-8" /> {/* Quantity value */}
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" /> {/* "Open Quantity:" label */}
            <Skeleton className="h-4 w-8" /> {/* Open quantity value */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" /> {/* Progress bar */}
            <div className="text-center">
              <Skeleton className="h-3 w-8 mx-auto" /> {/* Progress percentage */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Alert Skeleton (conditionally shown) */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5 rounded-full" /> {/* Alert icon */}
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" /> {/* Alert message */}
              <Skeleton className="h-3 w-32" /> {/* Timestamp */}
            </div>
            <Skeleton className="h-8 w-16" /> {/* Action button */}
          </div>
        </CardContent>
      </Card>

      {/* Bins Table Skeleton */}
      <div className="rounded-md border">
        <div className="p-4">
          {/* Table Header */}
          <div className="grid grid-cols-2 gap-4 pb-3 border-b">
            <Skeleton className="h-4 w-8" /> {/* "Bin" header */}
            <div className="text-right">
              <Skeleton className="h-4 w-16 ml-auto" /> {/* "Quantity" header */}
            </div>
          </div>
          
          {/* Table Rows */}
          {[...Array(3)].map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 py-3 border-b last:border-b-0">
              <Skeleton className="h-4 w-20" /> {/* Bin code */}
              <div className="text-right">
                <Skeleton className="h-4 w-8 ml-auto" /> {/* Quantity */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bin Location Scanner Skeleton */}
      <Card className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" /> {/* Scanner label */}
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" /> {/* Scanner input */}
            <Skeleton className="h-10 w-20" /> {/* Scan button */}
          </div>
        </div>
      </Card>
    </div>
  );
}