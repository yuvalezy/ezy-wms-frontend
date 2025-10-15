import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";

export const TransferUserCardSkeleton = () => (
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
