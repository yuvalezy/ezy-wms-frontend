import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth} from "./AppContext";
import {RoleType} from "@/assets";

interface ProtectedRouteProps {
    element: React.ReactElement;
    authorization?: RoleType;
    authorizations?: RoleType[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, authorization, authorizations, ...rest }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // If not authenticated, return a Navigate component to redirect to the login page
        return <Navigate to="/login"/>;
    } else if (
        (authorization !== undefined && !user?.roles.includes(authorization)) ||
        (authorizations !== undefined && !authorizations.some(auth => user?.roles.includes(auth)))
    ) {
        // If not authenticated, return a Navigate component to redirect to the login page
        return <Navigate to="/unauthorized"/>;
    }

    // If authenticated, render the intended component
    return React.cloneElement(element, rest);
}

export default ProtectedRoute;
