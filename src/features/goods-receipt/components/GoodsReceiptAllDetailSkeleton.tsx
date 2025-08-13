import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GoodsReceiptAllDetailSkeletonProps {
  /** Number of detail rows to show in skeleton */
  rowCount?: number;
  /** Whether to show the barcode column */
  displayBarcode?: boolean;
  /** Whether to show editable fields */
  enableUpdate?: boolean;
}

export const GoodsReceiptAllDetailSkeleton: React.FC<GoodsReceiptAllDetailSkeletonProps> = ({
  rowCount = 4,
  displayBarcode = true,
  enableUpdate = true
}) => {
  return (
    <div aria-label="Loading detail information...">
      {/* Mobile view - Card layout skeleton */}
      <div className="block sm:hidden">
        <ScrollArea className="h-[60vh]">
          <div className="grid grid-cols-1 gap-2">
            {Array.from({ length: rowCount }).map((_, index) => (
              <div key={`mobile-skeleton-${index}`} className="bg-white rounded-lg shadow-sm mb-4 p-4">
                <div className="mb-4">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-8 mr-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-12 mr-2" />
                      {enableUpdate ? (
                        <Skeleton className="h-8 w-20 mt-1" />
                      ) : (
                        <Skeleton className="h-4 w-12" />
                      )}
                    </div>
                  </div>
                  {displayBarcode && (
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-14 mr-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  )}
                </div>
                
                {enableUpdate && (
                  <div className="flex items-center pt-2 border-t border-gray-100">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Desktop view - Table layout skeleton */}
      <div className="hidden sm:block">
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-4 w-10 mx-auto" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
                {displayBarcode && (
                  <TableHead className="text-center"><Skeleton className="h-4 w-14 mx-auto" /></TableHead>
                )}
                {enableUpdate && (
                  <TableHead className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, index) => (
                <TableRow key={`desktop-skeleton-${index}`}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="text-center">
                    {enableUpdate ? (
                      <Skeleton className="h-8 w-24 mx-auto" />
                    ) : (
                      <Skeleton className="h-4 w-16 mx-auto" />
                    )}
                  </TableCell>
                  {displayBarcode && (
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  )}
                  {enableUpdate && (
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-4 mx-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

export default GoodsReceiptAllDetailSkeleton;