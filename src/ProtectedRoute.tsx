// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import {useAuth} from "./AppContext";

interface ProtectedRouteProps {
    element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, ...rest }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // If not authenticated, return a Navigate component to redirect to the login page
        return <Navigate to="/login" />;
    }

    // If authenticated, render the intended component
    return React.cloneElement(element, rest);
}

export default ProtectedRoute;
