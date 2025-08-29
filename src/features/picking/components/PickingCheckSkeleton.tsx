import React from 'react';
import {Skeleton} from '@/components/ui/skeleton';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

export const PickingCheckSkeleton: React.FC = () => {
  return (
    <div aria-label="Loading picking check data...">
      {/* Summary Stats Card Skeleton */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Started By Skeleton */}
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
          
          {/* Progress Skeleton */}
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-12" />
          </div>
          
          {/* Discrepancies Skeleton */}
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          
          {/* Complete Check Button Skeleton */}
          <div className="flex items-end">
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>
      </div>

      {/* Alert Skeleton (conditionally shown for discrepancies) */}
      <div className="mb-4 p-3 border border-red-200 rounded bg-red-50">
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-0.5" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Check Items Table Skeleton */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Generate 5-8 skeleton rows for typical pick list */}
          {Array.from({ length: 6 }).map((_, index) => (
            <TableRow key={index} className="bg-gray-50">
              {/* Item Code */}
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              
              {/* Description */}
              <TableCell>
                <Skeleton className="h-4 w-32 md:w-48" />
              </TableCell>
              
              {/* Picked Quantity */}
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              
              {/* Checked Quantity */}
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              
              {/* Status/Difference */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};