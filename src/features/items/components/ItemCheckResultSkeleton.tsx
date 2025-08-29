import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

export const ItemCheckResultSkeleton: React.FC = () => {
  return (
    <div className="px-3 pt-3 md:px-0 md:pt-0" aria-label="Loading...">
      {/* Item Details Skeleton */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <Tabs defaultValue="stock" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock" disabled>
            <Skeleton className="h-4 w-12" />
          </TabsTrigger>
          <TabsTrigger value="barcodes" disabled>
            <Skeleton className="h-4 w-16" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stock" className="mt-4">
          {/* Stock Tab Content Skeleton */}
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2">
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="divide-y">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4 px-4 py-3">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="barcodes" className="mt-4">
          {/* Barcodes Tab Content Skeleton */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
            
            {/* Barcodes List Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};