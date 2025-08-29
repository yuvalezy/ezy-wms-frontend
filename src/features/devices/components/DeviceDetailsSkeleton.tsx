import {Skeleton} from "@/components/ui/skeleton";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

interface DeviceDetailsSkeletonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeviceDetailsSkeleton({ open, onOpenChange }: DeviceDetailsSkeletonProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl" aria-label="Loading device details...">
        <DialogHeader>
          <DialogTitle>
            <Skeleton className="h-5 w-32" />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">
              <Skeleton className="h-4 w-12" />
            </TabsTrigger>
            <TabsTrigger value="audit">
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Skeleton className="h-5 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Device Name */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Skeleton className="w-4 h-4 mr-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-5 w-32" />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Skeleton className="w-4 h-4 mr-2" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>

                  {/* Device UUID */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Skeleton className="w-4 h-4 mr-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                  </div>

                  {/* Registration Date */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Skeleton className="w-4 h-4 mr-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                {/* Status Notes */}
                <div className="space-y-2 pt-4 border-t">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Skeleton className="h-5 w-28" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <Skeleton className="w-8 h-8 rounded-full" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-3 h-3" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}