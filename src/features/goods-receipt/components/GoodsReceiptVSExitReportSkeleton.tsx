import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GoodsReceiptVSExitReportSkeletonProps {
  /** Number of report cards to show in skeleton */
  cardCount?: number;
  /** Whether to show the detailed report view skeleton */
  showDetailedView?: boolean;
}

export const GoodsReceiptVSExitReportSkeleton: React.FC<GoodsReceiptVSExitReportSkeletonProps> = ({
  cardCount = 3,
  showDetailedView = false
}) => {
  if (showDetailedView) {
    return (
      <div aria-label="Loading report details...">
        {/* Info box skeleton */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </div>

        {/* Mobile View - Card Layout Skeleton */}
        <div className="block sm:hidden gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center border-b-2 border-primary font-bold mb-4">
                  <div className="w-[30%]">
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex-1 flex justify-around text-center">
                    <div className="flex-1">
                      <Skeleton className="h-3 w-8 mx-auto" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-3 w-10 mx-auto" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex-1 flex justify-around text-center">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex-1 flex justify-around text-center">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop View - Table Layout Skeleton */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2}><Skeleton className="h-4 w-12" /></TableHead>
                <TableHead rowSpan={2}><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead colSpan={3} className="text-center border-l">
                  <Skeleton className="h-4 w-20 mx-auto" />
                </TableHead>
                <TableHead colSpan={3} className="text-center border-l">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="text-center border-l"><Skeleton className="h-3 w-10 mx-auto" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-3 w-12 mx-auto" /></TableHead>
                <TableHead className="text-center border-r"><Skeleton className="h-3 w-12 mx-auto" /></TableHead>
                <TableHead className="text-center border-l"><Skeleton className="h-3 w-10 mx-auto" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-3 w-12 mx-auto" /></TableHead>
                <TableHead className="text-center border-r"><Skeleton className="h-3 w-12 mx-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-center border-l"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                  <TableCell className="text-center border-r"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell className="text-center border-l"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                  <TableCell className="text-center border-r"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Default view - Report list skeleton
  return (
    <div aria-label="Loading reports...">
      {Array.from({ length: cardCount }).map((_, index) => (
        <div key={index} className="mb-2">
          <Card className="mb-4 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default GoodsReceiptVSExitReportSkeleton;