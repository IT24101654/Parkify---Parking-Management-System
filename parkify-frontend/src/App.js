import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
import 'font-awesome/css/font-awesome.min.css';
import './App.css';
import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import Register from "./Pages/Register";

import Dashboard from './Pages/Super-Admin/Dashboard';

import PODashboard from './Pages/Parking-Owner/PODashboard';

import Drdashboard from './Pages/Driver/Drdashboard';

import ProtectedRoute from './Components/ProtectedRoute';

=======
import './App.css'; // App.css link කිරීම

import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Register from "./Pages/Register";

>>>>>>> eae4d27 (Update parkify-frontend/src/App.js)
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
<<<<<<< HEAD
                
              
                <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Dashboard /></ProtectedRoute>} />
                
                <Route path="/po-dashboard" element={<ProtectedRoute allowedRoles={['PARKING_OWNER']}><PODashboard /></ProtectedRoute>} />
                
                <Route path="/driver-dashboard" element={<ProtectedRoute allowedRoles={['DRIVER']}><Drdashboard /></ProtectedRoute>} />

=======
                <Route path="/dashboard" element={<Dashboard />} />
>>>>>>> eae4d27 (Update parkify-frontend/src/App.js)
            </Routes>
        </Router>
    );
}

export default App;