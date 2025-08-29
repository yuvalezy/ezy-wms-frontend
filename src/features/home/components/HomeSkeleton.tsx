import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';
import {Card, CardContent, CardHeader} from '@/components/ui/card';

export const HomeSkeleton: React.FC = () => {
  return (
    <div aria-label="Loading...">
      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6 px-2 md:px-6 py-3 md:py-6">
        {/* Generate 4 skeleton KPI cards (typical count for dashboard) */}
        {Array.from({ length: 4 }).map((_, index) => (
          <Card 
            key={index}
            className="group relative overflow-hidden bg-white min-h-[140px] md:min-h-[160px] border border-gray-200 rounded-xl border-l-4 border-l-gray-300 flex flex-col"
          >
            <CardHeader className="flex flex-row items-start justify-between py-3 px-4 md:px-6 flex-shrink-0">
              <div className="flex-1 pr-3">
                <Skeleton className="h-4 md:h-5 w-20 md:w-24" />
              </div>
              <div className="flex-shrink-0 ml-auto p-1 rounded-lg bg-gray-50">
                <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded" />
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 pb-4 flex-1 flex items-center">
              <Skeleton className="h-8 md:h-10 w-16 md:w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Dashboard Summary Section Skeleton */}
      <div className="mx-2 md:mx-6 mt-3 md:mt-6 p-3 md:p-6 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-sm">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-1 w-8 bg-gray-300 rounded-full"></div>
          <Skeleton className="h-5 md:h-6 w-32 md:w-40" />
        </div>
        
        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Total Items Card Skeleton */}
          <div className="bg-white p-4 md:p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-20" />
              <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
            </div>
            <Skeleton className="h-8 md:h-9 w-24 md:w-32 mb-1" />
            <Skeleton className="h-3 w-28" />
          </div>
          
          {/* Active Modules Card Skeleton */}
          <div className="bg-white p-4 md:p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
              <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
            </div>
            <Skeleton className="h-8 md:h-9 w-8 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
          
          {/* Warehouse Card Skeleton */}
          <div className="bg-white p-4 md:p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-20" />
              <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
            </div>
            <Skeleton className="h-5 md:h-6 w-36 mb-1" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
};