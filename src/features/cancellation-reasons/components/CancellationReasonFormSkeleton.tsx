import { Skeleton } from "@/components/ui/skeleton";

export function CancellationReasonFormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto" aria-label="Loading cancellation reason form...">
      <div className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Checkbox Fields */}
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex flex-row items-start space-x-3 space-y-0">
            <Skeleton className="h-4 w-4 mt-1" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}