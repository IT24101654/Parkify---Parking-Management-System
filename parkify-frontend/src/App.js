import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';
import ProtectedRoute from './Components/ProtectedRoute';

// Code splitting - lazy load all pages for better Lighthouse performance
const LandingPage = lazy(() => import('./Pages/LandingPage'));
const Login = lazy(() => import('./Pages/Login'));
const Register = lazy(() => import('./Pages/Register'));
const Dashboard = lazy(() => import('./Pages/Super-Admin/Dashboard'));
const PODashboard = lazy(() => import('./Pages/Parking-Owner/PODashboard'));
const Drdashboard = lazy(() => import('./Pages/Driver/Drdashboard'));
const DrProfile = lazy(() => import('./Pages/Driver/DrProfile'));
const POProfile = lazy(() => import('./Pages/Parking-Owner/POProfile'));
const AdminProfile = lazy(() => import('./Pages/Super-Admin/AdminProfile'));


const LoadingFallback = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f0f4f8',
        fontFamily: 'sans-serif',
        color: '#2D4057',
        fontSize: '1.2rem'
    }}>
        Loading Parkify...
    </div>
);

function App() {
    return (
        <Router>
            <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-profile"
                    element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                            <AdminProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/po-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['PARKING_OWNER']}>
                            <PODashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/po-profile"
                    element={
                        <ProtectedRoute allowedRoles={['PARKING_OWNER']}>
                            <POProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/driver-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['DRIVER']}>
                            <Drdashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dr-profile"
                    element={
                        <ProtectedRoute allowedRoles={['DRIVER']}>
                            <DrProfile />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            </Suspense>
        </Router>
    );
}

export default App;