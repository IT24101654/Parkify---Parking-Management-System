import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

import Overview from './Overview';
import ManageUser from './ManageUsers';
import AdminProfile from './AdminProfile';

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [adminData, setAdminData] = useState(null);

    useEffect(() => {
        const fetchAdminProfile = async () => {
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

                setAdminData(response.data);
            } catch (error) {
                console.error("Failed to fetch admin data", error);
                setAdminData({
                    id: localStorage.getItem('userId') || 1, 
                    name: "Super Admin",
                    email: "admin@parkify.ai",
                    address: "123 Parkify Blvd, Colombo",
                    phoneNumber: "+94 77 123 4567",
                    profilePicture: null
                });
            }
        };

        fetchAdminProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!adminData) return <div className="loading">Loading Dashboard...</div>;

    return (
        <div className="db-container">
            <aside className="db-sidebar">
                <div className="db-logo">
                    <span className="material-symbols-outlined">garage</span>
                    <h1>Parkify</h1>
                </div>
                <nav className="db-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="nav-text">Overview</span>
                    </button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                        <span className="material-symbols-outlined">group</span>
                        <span className="nav-text">Users</span>
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <span className="material-symbols-outlined">person</span>
                        <span className="nav-text">Profile</span>
                    </button>
                </nav>
                <button className="db-logout-bottom" onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                </button>
            </aside>

            <main className="db-main">
                <header className="db-header">
                    <div className="db-search">
                        <span className="material-symbols-outlined">search</span>
                        <input type="text" placeholder="Search analytics..." />
                    </div>
                    <div className="db-nav-actions">
                        <div className="db-user-profile" onClick={() => setActiveTab('profile')}>
                            <img src={adminData.profilePicture ? `http://localhost:8080/api/users/profile-image/${adminData.profilePicture}` : "https://ui-avatars.com/api/?name=Admin"} alt="Avatar" />
                            <div className="db-user-info">
                                <p className="u-name">{adminData.name}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="db-content">
                    {activeTab === 'overview' && <Overview />}
                    {activeTab === 'users' && <ManageUser />}
                    {activeTab === 'profile' && (
                        <AdminProfile adminData={adminData} setAdminData={setAdminData} />
                    )}
                </div>
            </main>
        </div>
    );
}
export default Dashboard;