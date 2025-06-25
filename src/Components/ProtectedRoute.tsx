import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from "./AppContext";
import {RoleType} from "@/assets";

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
    return <div>Loading...</div>; // Or spinner
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
