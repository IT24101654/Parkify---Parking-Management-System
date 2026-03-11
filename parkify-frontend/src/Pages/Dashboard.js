import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css'; // CSS link කිරීම

function Dashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole') || 'driver';
    const email = localStorage.getItem('userEmail') || 'User';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="dashboard-wrapper">
            <aside className="sidebar">
                <div className="logo" style={{ padding: '30px 20px' }}>
                    <span className="material-symbols-outlined logo-icon" style={{ color: 'white' }}>garage</span>
                    <span className="logo-text" style={{ color: 'white' }}>Parkify</span>
                </div>
                <nav className="side-nav">
                    <Link to="/dashboard" className="nav-item">
                        <span className="material-symbols-outlined">dashboard</span> Dashboard
                    </Link>
                    {role === 'super_admin' && (
                        <Link to="/manage-users" className="nav-item">
                            <span className="material-symbols-outlined">group</span> Manage Users
                        </Link>
                    )}
                    {role === 'owner' && (
                        <Link to="/my-slots" className="nav-item">
                            <span className="material-symbols-outlined">local_parking</span> My Slots
                        </Link>
                    )}
                    {role === 'driver' && (
                        <Link to="/bookings" className="nav-item">
                            <span className="material-symbols-outlined">history</span> My Bookings
                        </Link>
                    )}
                    <Link to="/settings" className="nav-item">
                        <span className="material-symbols-outlined">settings</span> Settings
                    </Link>
                </nav>
                <button onClick={handleLogout} className="logout-btn">
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>logout</span>
                    Logout
                </button>
            </aside>

            <main className="main-content">
                <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: '800', color: '#2D4057' }}>Overview</h2>
                        <p style={{ color: '#7A868E', margin: 0 }}>
                            Welcome back, <strong>{role.replace('_', ' ').toUpperCase()}</strong>
                        </p>
                    </div>
                    <div style={{ background: 'white', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #ddd', color: '#2D4057' }}>
                        {email}
                    </div>
                </header>

                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px' }}>
                    <div className="stat-box">
                        <h4 style={{ color: '#7A868E', margin: 0 }}>
                            Total {role === 'driver' ? 'Spent' : 'Revenue'}
                        </h4>
                        <p style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '10px', color: '#2D4057', margin: '10px 0 0 0' }}>
                            {role === 'driver' ? '$120.50' : '$4,250.00'}
                        </p>
                    </div>
                    <div className="stat-box">
                        <h4 style={{ color: '#7A868E', margin: 0 }}>
                            Active {role === 'driver' ? 'Bookings' : 'Occupancy'}
                        </h4>
                        <p style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '10px', color: '#AE8E82', margin: '10px 0 0 0' }}>
                            {role === 'driver' ? '01' : '82%'}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;