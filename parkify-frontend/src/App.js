import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // එක පාරක් පමණක් දාන්න
import './App.css';

// Pages
import LandingPage from './Pages/LandingPage';
import Login from './Pages/Login';
import Register from "./Pages/Register";
import Dashboard from './Pages/Super-Admin/Dashboard';
import PODashboard from './Pages/Parking-Owner/PODashboard';
import Drdashboard from './Pages/Driver/Drdashboard';

// Inventory Components
import InventoryDashboard from './Components/Inventory/InventoryDashboard';
import ManageInventory from './Components/Inventory/ManageInventory';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/admin-dashboard" element={<Dashboard />} />
                <Route path="/po-dashboard" element={<PODashboard />} />
                <Route path="/driver-dashboard" element={<Drdashboard />} />

                <Route path="/inventory" element={<InventoryDashboard />} />
                <Route path="/inventory/:type" element={<ManageInventory />} />

            </Routes>
        </Router>
    );
}

export default App;