import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent} from "@/components/ui/card";

export const TransferProcessSkeleton = () => (
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
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-14"/>
                        <Skeleton className="h-4 w-20"/>
                    </div>
                    <div className="pt-2">
                        <Skeleton className="h-2 w-full"/>
                        <Skeleton className="h-3 w-20 mx-auto mt-1"/>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Scanner cards skeleton */}
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-48"/>
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-32"/>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-48"/>
                    <Skeleton className="h-10 w-full"/>
                    <Skeleton className="h-10 w-32"/>
                </div>
            </CardContent>
        </Card>

        {/* Optional target items link skeleton */}
        <div className="space-y-4 p-2">
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
                <Skeleton className="h-6 w-6"/>
                <Skeleton className="h-6 w-48"/>
            </div>
        </div>
    </div>
);
