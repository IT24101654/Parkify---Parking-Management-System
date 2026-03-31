import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import InventoryDashboard from '../../Components/Inventory/InventoryDashboard';
import './PODashboard.css';

function PODashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUserId = localStorage.getItem('userId');

                if (!token) {
                    navigate('/login');
                    return;
                }

                let response;
                try {
                    response = await axios.get('/api/users/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (meErr) {
                    if (!storedUserId) {
                        throw meErr;
                    }
                    response = await axios.get(`/api/users/${storedUserId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

                setUserData(response.data);
            } catch (error) {
                console.error('Failed to fetch user data', error);
                setUserData({
                    id: localStorage.getItem('userId') || 1,
                    name: 'Parking Owner',
                    email: localStorage.getItem('userEmail') || 'owner@parkify.ai',
                    hasInventory: false,
                    hasServiceCenter: false
                });
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!userData) return <div className="loading">Loading Dashboard...</div>;

    return (
        <div className="po-dashboard">
            {/* Sidebar */}
            <aside className="po-sidebar">
                <div className="sidebar-logo">
                    <span className="material-symbols-outlined">directions_car</span>
                    <h1>Parkify</h1>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="nav-text">Overview</span>
                    </button>
                    <button className={activeTab === 'slots' ? 'active' : ''} onClick={() => setActiveTab('slots')}>
                        <span className="material-symbols-outlined">garage</span>
                        <span className="nav-text">My Slots</span>
                    </button>
                    {userData.hasInventory && (
                        <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>
                            <span className="material-symbols-outlined">inventory</span>
                            <span className="nav-text">Inventory</span>
                        </button>
                    )}
                    {userData.hasServiceCenter && (
                        <button className={activeTab === 'service' ? 'active' : ''} onClick={() => setActiveTab('service')}>
                            <span className="material-symbols-outlined">build</span>
                            <span className="nav-text">Service Center</span>
                        </button>
                    )}
                    <button className={activeTab === 'earnings' ? 'active' : ''} onClick={() => setActiveTab('earnings')}>
                        <span className="material-symbols-outlined">analytics</span>
                        <span className="nav-text">Earnings</span>
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <span className="material-symbols-outlined">person</span>
                        <span className="nav-text">My Profile</span>
                    </button>
                </nav>
                <button className="po-logout-bottom" onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                </button>
            </aside>

            <main className="po-main">
                <header className="po-navbar">
                    <div className="nav-search">
                        <span className="material-symbols-outlined">search</span>
                        <input type="text" placeholder="Search bookings..." />
                    </div>
                    <div className="nav-profile">
                        <span className="material-symbols-outlined">notifications</span>
                        <div className="profile-info">
                            <p className="profile-name">{userData.name}</p>
                            <p className="profile-email">{userData.email}</p>
                        </div>
                        <div className="profile-avatar">PO</div>
                    </div>
                </header>

                <div className="po-content">
                    {activeTab === 'overview' && (
                        <>
                            <div className="welcome-section">
                                <h1>Welcome to your Dashboard</h1>
                                <p>Manage your parking spaces and monitor earnings in real-time.</p>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3>Total Slots</h3>
                                    <p className="stat-value">24</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Active Bookings</h3>
                                    <p className="stat-value">08</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Monthly Revenue</h3>
                                    <p className="stat-value">Rs. 15,400</p>
                                </div>
                            </div>
                        </>
                    )}
                    {activeTab === 'slots' && (
                        <div className="content-section">
                            <h1>My Slots</h1>
                            <p>Manage your parking slots here.</p>
                        </div>
                    )}
                    {activeTab === 'inventory' && userData.hasInventory && (
                        <InventoryDashboard />
                    )}
                    {activeTab === 'service' && userData.hasServiceCenter && (
                        <div className="content-section">
                            <h1>Service Center</h1>
                            <p>Manage your vehicle service center.</p>
                        </div>
                    )}
                    {activeTab === 'earnings' && (
                        <div className="content-section">
                            <h1>Earnings</h1>
                            <p>View your earnings and analytics.</p>
                        </div>
                    )}
                    {activeTab === 'profile' && (
                        <div className="content-section">
                            <h1>My Profile</h1>
                            <p>Update your profile information.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default PODashboard;