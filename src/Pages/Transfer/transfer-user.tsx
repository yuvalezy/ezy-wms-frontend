import ContentTheme from "../../components/ContentTheme";
import {useTranslation} from "react-i18next";
import {Alert, AlertDescription, useThemeContext} from "@/components";
import React, {useEffect, useState} from "react";
import {Status} from "@/features/shared/data";
import TransferCard from "@/features/transfer/components/transfer-card";
import TransferTable from "@/features/transfer/components/transfer-table";
import {AlertCircle} from "lucide-react";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {transferService} from "@/features/transfer/data/transefer-service";
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Progress} from "@/components/ui/progress";

export default function TransferUser() {
  const {setError} = useThemeContext();
  const {t} = useTranslation();
  const [transfers, setTransfers] = useState<TransferDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    transferService.search({statuses: [Status.Open, Status.InProgress], progress: true})
      .then((data) => setTransfers(data))
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  }, [setError]);

  // Skeleton components
  const TableSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Skeleton className="h-4 w-12" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-16" /></TableHead>
          <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          <TableHead><Skeleton className="h-4 w-24" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Progress value={0} className="w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const CardSkeleton = () => (
    <Card className="mb-4 shadow-lg">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="py-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="pt-2">
            <Progress value={0} className="w-full" />
            <Skeleton className="h-3 w-20 mx-auto mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ContentTheme title={t("transfer")}>
      <div className="my-4">
        {isLoading ? (
          <>
            {/* Mobile view - Card skeletons */}
            <div className="block sm:hidden" aria-label="Loading...">
              {Array.from({ length: 3 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
            
            {/* Desktop view - Table skeleton */}
            <div className="hidden sm:block" aria-label="Loading...">
              <TableSkeleton />
            </div>
          </>
        ) : transfers.length ? (
          <>
            {/* Mobile view - Cards */}
            <div className="block sm:hidden">
              {transfers.map((transfer) => (
                <TransferCard key={transfer.id} doc={transfer}/>
              ))}
            </div>
            
            {/* Desktop view - Table */}
            <div className="hidden sm:block">
              <TransferTable transfers={transfers} />
            </div>
          </>
        ) : (
          <Alert variant="information">
            <AlertCircle className="h-4 w-4"/>
            <AlertDescription>
              {t("noTransferData")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ContentTheme>
  );

}
