import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';
import {Card} from '@/components/ui/card';
import {Box, Grid3x3, Package} from 'lucide-react';

export const ItemCheckStockSkeleton: React.FC = () => {
  return (
    <div className="space-y-4" aria-label="Loading stock information...">
      {/* Stock List Skeleton */}
      <Card className="p-0 gap-0">
        {[...Array(3)].map((_, index) => (
          <div key={index} className={`${index !== 0 ? 'border-t' : ''}`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              
              {/* Unit indicators skeleton */}
              <div className="flex gap-2 mx-4">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
              </div>
              
              <Skeleton className="w-5 h-5 ml-2" />
            </div>
          </div>
        ))}
      </Card>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Grid3x3 className="w-6 h-6 text-gray-400" />
          </div>
          <Skeleton className="h-8 w-12 mx-auto mb-2" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </Card>

        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <Skeleton className="h-8 w-12 mx-auto mb-2" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </Card>

        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <Box className="w-6 h-6 text-gray-400" />
          </div>
          <Skeleton className="h-8 w-12 mx-auto mb-2" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </Card>
      </div>
    </div>
  );
};