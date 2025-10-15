import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent} from "@/components/ui/card";

export const TransferApprovalDetailSkeleton = () => (
    <div className="grid gap-2" aria-label="Loading...">
        {/* Transfer card skeleton */}
        <Card className="shadow-lg">
            <CardContent className="py-4">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-16"/>
                        <Skeleton className="h-4 w-24"/>
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-20"/>
                        <Skeleton className="h-4 w-20"/>
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-18"/>
                        <Skeleton className="h-4 w-28"/>
                    </div>
                    <div className="pt-2">
                        <Skeleton className="h-2 w-full"/>
                        <Skeleton className="h-3 w-20 mx-auto mt-1"/>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Content table skeleton */}
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-48"/>
                    {Array.from({length: 3}).map((_, index) => (
                        <div key={index} className="space-y-2 border-b pb-4">
                            <Skeleton className="h-4 w-32"/>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-24"/>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);
