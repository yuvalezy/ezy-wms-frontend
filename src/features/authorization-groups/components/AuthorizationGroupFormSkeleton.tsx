import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import ContentTheme from "@/components/ContentTheme";

interface AuthorizationGroupFormSkeletonProps {
  isEditing?: boolean;
}

export function AuthorizationGroupFormSkeleton({ isEditing = false }: AuthorizationGroupFormSkeletonProps) {
  return (
    <ContentTheme 
      title="Loading..."
      titleBreadcrumbs={[
        { label: "Authorization Groups" },
        { label: isEditing ? "Edit Group" : "Add Group" }
      ]}
    >
      <div className="max-w-4xl mx-auto" aria-label="Loading authorization group form...">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>

          {/* Authorizations Section */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            
            {/* Role Categories */}
            {[...Array(3)].map((_, categoryIndex) => (
              <Card key={categoryIndex} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...Array(4)].map((_, roleIndex) => (
                      <div key={roleIndex} className="flex items-start space-x-3 p-2 rounded border">
                        <Skeleton className="h-4 w-4 mt-1" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}

            {/* Validation Message */}
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </div>
    </ContentTheme>
  );
}