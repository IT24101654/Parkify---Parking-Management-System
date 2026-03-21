import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Drdashboard.css';

function Drdashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('find-slots');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/login');
                    return;
                }

                // Backend එකෙන් user data ගමු
                const response = await axios.get('/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Failed to fetch user data', error);
                // API එක වැඩ නැත්තම් local storage එකෙන් තාවකාලිකව දත්ත ගමු
                setUserData({
                    name: localStorage.getItem('userName') || 'Driver Name',
                    email: localStorage.getItem('userEmail') || 'driver@parkify.ai',
                    role: 'DRIVER'
                });
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!userData) return <div className="loading">Initializing Driver Dashboard...</div>;

    return (
        <div className="dr-dashboard">
            {/* Sidebar */}
            <aside className="dr-sidebar">
                <div className="sidebar-logo">
                    <span className="material-symbols-outlined">directions_car</span>
                    <h1>Parkify</h1>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'find-slots' ? 'active' : ''} onClick={() => setActiveTab('find-slots')}>
                        <span className="material-symbols-outlined">explore</span>
                        <span className="nav-text">Find Slots</span>
                    </button>
                    <button className={activeTab === 'my-bookings' ? 'active' : ''} onClick={() => setActiveTab('my-bookings')}>
                        <span className="material-symbols-outlined">book_online</span>
                        <span className="nav-text">My Bookings</span>
                    </button>
                    <button className={activeTab === 'vehicles' ? 'active' : ''} onClick={() => setActiveTab('vehicles')}>
                        <span className="material-symbols-outlined">minor_crash</span>
                        <span className="nav-text">My Vehicles</span>
                    </button>
                    <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                        <span className="nav-text">Payments</span>
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                        <span className="material-symbols-outlined">person</span>
                        <span className="nav-text">Profile</span>
                    </button>
                </nav>
                <button className="dr-logout-bottom" onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="dr-main">
                <header className="dr-navbar">
                    <div className="nav-search">
                        <span className="material-symbols-outlined">location_on</span>
                        <input type="text" placeholder="Where do you want to park?" />
                    </div>
                    <div className="nav-profile">
                        <span className="material-symbols-outlined">notifications</span>
                        <div className="profile-info">
                            <p className="profile-name">{userData.name}</p>
                            <p className="profile-email">Driver Account</p>
                        </div>
                        <div className="profile-avatar">DR</div>
                    </div>
                </header>

                <div className="dr-content">
                    {activeTab === 'find-slots' && (
                        <>
                            <div className="welcome-section">
                                <h1>Hello, {userData.name.split(' ')[0]}!</h1>
                                <p>Ready to find the perfect parking spot today?</p>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3>Total Parkings</h3>
                                    <p className="stat-value">12</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Ongoing Session</h3>
                                    <p className="stat-value">None</p>
                                </div>
                                <div className="stat-card">
                                    <h3>Points Earned</h3>
                                    <p className="stat-value">450</p>
                                </div>
                            </div>

                            {/* Nearby Parking (Sample) */}
                            <div className="nearby-section" style={{marginTop:'30px'}}>
                                <h2>Recommended for you</h2>
                                <div className="parking-list-demo">
                                    <p style={{color: '#6c757d'}}>Interactive Map and nearby locations will appear here.</p>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'my-bookings' && (
                        <div className="content-section">
                            <h1>My Bookings</h1>
                            <p>History of your parking reservations.</p>
                        </div>
                    )}

                    {activeTab === 'vehicles' && (
                        <div className="content-section">
                            <h1>My Vehicles</h1>
                            <p>Manage your registered vehicles.</p>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="content-section">
                            <h1>My Profile</h1>
                            <p>Update your personal and preference settings.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Drdashboard;