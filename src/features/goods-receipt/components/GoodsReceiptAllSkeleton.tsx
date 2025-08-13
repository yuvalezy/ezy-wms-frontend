import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GoodsReceiptAllSkeletonProps {
  /** Number of table rows to show in skeleton */
  rowCount?: number;
  /** Whether to show the target columns (delivery/showroom) */
  showTarget?: boolean;
  /** Whether to show the modify button column */
  allowModify?: boolean;
}

export const GoodsReceiptAllSkeleton: React.FC<GoodsReceiptAllSkeletonProps> = ({
  rowCount = 6,
  showTarget = true,
  allowModify = true
}) => {
  return (
    <div aria-label="Loading goods receipt report...">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            {showTarget && <TableHead><Skeleton className="h-4 w-16" /></TableHead>}
            {showTarget && <TableHead><Skeleton className="h-4 w-18" /></TableHead>}
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12" /></TableHead>
            {allowModify && <TableHead className="border-l"><Skeleton className="h-4 w-16" /></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <React.Fragment key={`skeleton-row-${index}`}>
              <TableRow key={`data-${index}`}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                {showTarget && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                {showTarget && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                {allowModify && (
                  <TableCell className="border-l">
                    <Skeleton className="h-8 w-20" />
                  </TableCell>
                )}
              </TableRow>
              {/* Mobile view description row skeleton */}
              <TableRow className="sm:hidden" key={`description-${index}`}>
                <TableCell 
                  className="bg-gray-100 border-b-1"
                  colSpan={allowModify ? 8 : 7}
                >
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-20 mr-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GoodsReceiptAllSkeleton;