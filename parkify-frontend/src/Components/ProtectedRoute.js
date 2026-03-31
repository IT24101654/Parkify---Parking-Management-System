import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole.toUpperCase())) {
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

    return children;
};

export default ProtectedRoute;
