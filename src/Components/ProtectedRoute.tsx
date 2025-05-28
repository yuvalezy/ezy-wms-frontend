import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth} from "./AppContext";
import {Authorization} from "@/assets";

interface ProtectedRouteProps {
    element: React.ReactElement;
    authorization?: Authorization;
    authorizations?: Authorization[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, authorization, authorizations, ...rest }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // If not authenticated, return a Navigate component to redirect to the login page
        return <Navigate to="/login"/>;
    } else if (
        (authorization !== undefined && !user?.authorizations.includes(authorization)) ||
        (authorizations !== undefined && !authorizations.some(auth => user?.authorizations.includes(auth)))
    ) {
        // If not authenticated, return a Navigate component to redirect to the login page
        return <Navigate to="/unauthorized"/>;
    }

    // If authenticated, render the intended component
    return React.cloneElement(element, rest);
}

export default ProtectedRoute;
