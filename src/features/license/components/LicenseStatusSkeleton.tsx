import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export const LicenseStatusSkeleton: React.FC = () => {
  return (
    <Card aria-label="Loading license status...">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>

          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};