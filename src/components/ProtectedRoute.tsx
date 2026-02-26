import React from 'react';
import {Navigate} from 'react-router';
import {useAuth} from "./AppContext";
import {Skeleton} from "@/components/ui/skeleton";

import {RoleType} from "@/features/authorization-groups/data/authorization-group";

interface ProtectedRouteProps {
  element: React.ReactElement;
  authorization?: RoleType;
  authorizations?: RoleType[];
  superUser?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                         element,
                                                         authorization,
                                                         authorizations,
                                                         superUser,
                                                         ...rest
                                                       }) => {
  const {isAuthenticated, user, isLoading} = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4" aria-label="Loading...">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-4 border rounded space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, return a Navigate component to redirect to the login page
    return <Navigate to="/login"/>;
  } else if (
    (authorization !== undefined && !user?.roles.includes(authorization) && !user?.superUser) ||
    (authorizations !== undefined && !authorizations.some(auth => user?.roles.includes(auth)) && !user?.superUser) ||
    (superUser && !user?.superUser)
  ) {
    // If not authenticated, return a Navigate component to redirect to the login page
    return <Navigate to="/unauthorized"/>;
  }

  // If authenticated, render the intended component
  return React.cloneElement(element, rest);
}

export default ProtectedRoute;
