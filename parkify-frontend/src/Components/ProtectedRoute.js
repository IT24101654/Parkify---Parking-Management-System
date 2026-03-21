import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Not logged in
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Role checks
    if (allowedRoles && userRole && !allowedRoles.includes(userRole.toUpperCase())) {
        // Determine correct redirect based on their proper role instead of blindly failing
        switch (userRole.toUpperCase()) {
            case 'SUPER_ADMIN':
                return <Navigate to="/dashboard" replace />;
            case 'PARKING_OWNER':
                return <Navigate to="/po-dashboard" replace />;
            case 'DRIVER':
                return <Navigate to="/dr-dashboard" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }

    // Authorized
    return children;
};

export default ProtectedRoute;
