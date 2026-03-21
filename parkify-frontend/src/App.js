import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import Dashboard from './Pages/Super-Admin/Dashboard';
import Register from "./Pages/Register";
import PODashboard from './Pages/Parking-Owner/PODashboard';
import Drdashboard from './Pages/Driver/Drdashboard';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Role based Dashboards */}
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/po-dashboard" element={
                    <ProtectedRoute allowedRoles={['PARKING_OWNER']}>
                        <PODashboard />
                    </ProtectedRoute>
                } />
                <Route path="/dr-dashboard" element={
                    <ProtectedRoute allowedRoles={['DRIVER']}>
                        <Drdashboard />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;