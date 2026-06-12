import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export const LicenseStatusSkeleton: React.FC = () => {
  return (
    <Card className="gap-0 overflow-hidden rounded-lg py-0" aria-label="Loading license status...">
      <CardHeader className="border-b bg-white px-4 py-4 md:px-5">
        <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-8 w-full rounded-md sm:w-24" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-4 py-4 md:px-5">
        <div className="grid overflow-hidden rounded-lg border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({length: 4}).map((_, index) => (
            <div key={index} className="bg-white p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-5 w-32" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({length: 3}).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-2 h-5 w-36" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
