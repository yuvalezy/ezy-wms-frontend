import { Skeleton } from "@/components/ui/skeleton";

export function UserFormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto" aria-label="Loading user form...">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Position Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <div className="relative">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="absolute right-2 top-2 h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Authorization Group Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Warehouses Section */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="border rounded-md p-3 max-h-40 space-y-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Super User Checkbox */}
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Skeleton className="h-4 w-4 mt-1" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>

            {/* External User Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}