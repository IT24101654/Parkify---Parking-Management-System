import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import Dashboard from './Pages/Super-Admin/Dashboard';
import Register from "./Pages/Register";
import PODashboard from './Pages/Parking-Owner/PODashboard'; // මේක හරියටම path එක බලන්න

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Role based Dashboards */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/po-dashboard" element={<PODashboard />} />
            </Routes>
        </Router>
    );
}

export default App;