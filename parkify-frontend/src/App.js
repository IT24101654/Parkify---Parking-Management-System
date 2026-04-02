import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';
import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import Register from "./Pages/Register";

import Dashboard from './Pages/Super-Admin/Dashboard';
import PODashboard from './Pages/Parking-Owner/PODashboard';
import Drdashboard from './Pages/Driver/Drdashboard';
import DrProfile from './Pages/Driver/DrProfile';
import POProfile from './Pages/Parking-Owner/POProfile';
import AdminProfile from './Pages/Super-Admin/AdminProfile';

import ProtectedRoute from './Components/ProtectedRoute';

function App() {
    return (
        <Router>
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
        </Router>
    );
}

export default App;