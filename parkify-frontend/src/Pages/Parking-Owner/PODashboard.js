import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PODashboard.css';

function PODashboard() {
    const navigate = useNavigate();
    const [ownerName, setOwnerName] = useState("Owner");

    useEffect(() => {
        // LocalStorage එකෙන් නම සහ විස්තර ගන්නවා
        const name = localStorage.getItem("userName");
        if(name) setOwnerName(name);

        // Security Check: Token එකක් නැත්නම් ආපහු Login එකට යවනවා
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole");
        if (!token || role !== 'owner') {
            // navigate('/login'); 
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="po-dashboard-layout">
            {/* --- SIDEBAR --- */}
            <aside className="po-sidebar">
                <div className="sidebar-brand">
                    <span className="material-symbols-outlined">local_parking</span>
                    <h2>Parkify PO</h2>
                </div>
                <nav className="sidebar-menu">
                    <div className="menu-item active">
                        <span className="material-symbols-outlined">dashboard</span>
                        <p>Overview</p>
                    </div>
                    <div className="menu-item">
                        <span className="material-symbols-outlined">garage</span>
                        <p>My Parking Slots</p>
                    </div>
                    <div className="menu-item">
                        <span className="material-symbols-outlined">list_alt</span>
                        <p>Bookings</p>
                    </div>
                    <div className="menu-item">
                        <span className="material-symbols-outlined">payments</span>
                        <p>Earnings</p>
                    </div>
                    <div className="menu-item">
                        <span className="material-symbols-outlined">settings</span>
                        <p>Settings</p>
                    </div>
                </nav>
                <div className="sidebar-footer" onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    <p>Logout</p>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="po-main-section">
                {/* TOP NAVBAR */}
                <header className="po-top-nav">
                    <div className="nav-search">
                        <span className="material-symbols-outlined">search</span>
                        <input type="text" placeholder="Search booking ID..." />
                    </div>
                    <div className="nav-profile">
                        <span className="material-symbols-outlined icon-btn">notifications</span>
                        <div className="profile-info">
                            <span className="owner-name">{ownerName}</span>
                            <span className="owner-role">Parking Owner</span>
                        </div>
                        <div className="avatar">PO</div>
                    </div>
                </header>

                {/* CONTENT BODY */}
                <div className="po-content">
                    <div className="welcome-section">
                        <h1>Hello, {ownerName}!</h1>
                        <p>Here is an update on your parking business today.</p>
                    </div>

                    <div className="po-stats-grid">
                        <div className="po-stat-card">
                            <div className="stat-icon-box" style={{background: '#E3F2FD', color: '#1E88E5'}}>
                                <span className="material-symbols-outlined">directions_car</span>
                            </div>
                            <div className="stat-text">
                                <h3>24</h3>
                                <p>Total Slots</p>
                            </div>
                        </div>
                        <div className="po-stat-card">
                            <div className="stat-icon-box" style={{background: '#F1F8E9', color: '#7CB342'}}>
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div className="stat-text">
                                <h3>18</h3>
                                <p>Booked Slots</p>
                            </div>
                        </div>
                        <div className="po-stat-card">
                            <div className="stat-icon-box" style={{background: '#FFF3E0', color: '#FB8C00'}}>
                                <span className="material-symbols-outlined">pending_actions</span>
                            </div>
                            <div className="stat-text">
                                <h3>06</h3>
                                <p>Available Slots</p>
                            </div>
                        </div>
                    </div>

                    <div className="recent-activity-table">
                        <h3>Recent Bookings</h3>
                        <div className="table-placeholder">
                            <p>Loading recent bookings...</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PODashboard;