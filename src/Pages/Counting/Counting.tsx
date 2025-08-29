import React, {useEffect, useState} from "react";
import ContentTheme from "@/components/ContentTheme";
import {useTranslation} from "react-i18next";
import {useThemeContext} from "@/components/ThemeContext";
import CountingCard from "@/features/counting/components/CountingCard";
import CountingTable from "@/features/counting/components/CountingTable";
import {Alert, AlertDescription} from "@/components";
import {AlertCircle} from "lucide-react";
import {Counting} from "@/features/counting/data/counting";
import {countingService} from "@/features/counting/data/counting-service";
import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export default function CountingList() {
  const {setError} = useThemeContext();
  const {t} = useTranslation();
  const [data, setData] = useState<Counting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    countingService.search()
      .then((data) => setData(data))
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
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ContentTheme title={t("counting")}>
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
      ) : data.length ? (
        <>
          {/* Mobile view - Cards */}
          <div className="block sm:hidden">
            {data.map((doc) => (
              <CountingCard key={doc.id} doc={doc}/>
            ))}
          </div>
          
          {/* Desktop view - Table */}
          <div className="hidden sm:block">
            <CountingTable countings={data} />
          </div>
        </>
      ) : (
        <Alert variant="information">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>
            {t("noCountingData")}
          </AlertDescription>
        </Alert>
      )}
    </ContentTheme>
  );
}
