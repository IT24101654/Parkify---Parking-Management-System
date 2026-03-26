import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);

    // --- Fetch Notifications ---
    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axios.get('http://localhost:8080/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // --- Close dropdown when clicking outside ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Mark single notification as read ---
    const handleNotificationClick = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    // --- Mark ALL notifications as read ---
    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const unread = notifications.filter(n => !n.read);
            await Promise.all(
                unread.map(n =>
                    axios.put(`http://localhost:8080/api/notifications/${n.id}/read`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    // --- Fetch Admin Profile ---
    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUserId = localStorage.getItem('userId');
                if (!token) { navigate('/login'); return; }

                let response;
                try {
                    response = await axios.get('/api/users/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch {
                    if (!storedUserId) throw new Error("No user ID");
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

    // --- IntersectionObserver for scroll-spy active tab ---
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveTab(entry.target.id);
                });
            },
            { rootMargin: '-20% 0px -70% 0px' }
        );
        const timeoutId = setTimeout(() => {
            document.querySelectorAll('.dashboard-section').forEach(s => observer.observe(s));
        }, 300);
        return () => { observer.disconnect(); clearTimeout(timeoutId); };
    }, [adminData]);

    const scrollToSection = (id) => {
        setActiveTab(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    // --- Icon per notification type ---
    const getNotificationIcon = (notif) => {
        const msg = (notif.message || '').toLowerCase();
        if (msg.includes('parking_owner') || msg.includes('parking owner')) return 'local_parking';
        if (msg.includes('driver')) return 'directions_car';
        return 'person_add';
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
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => scrollToSection('overview')}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="nav-text">Overview</span>
                    </button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => scrollToSection('users')}>
                        <span className="material-symbols-outlined">group</span>
                        <span className="nav-text">Users</span>
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => scrollToSection('profile')}>
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

                        {/* ─── Notification Bell ─── */}
                        <div className="db-notification-wrapper" ref={notificationRef}>
                            <button
                                className="db-notification-icon"
                                onClick={() => setShowNotifications(prev => !prev)}
                                aria-label="Notifications"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="db-notification-badge">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="db-notification-dropdown">
                                    <div className="db-notification-header">
                                        <div className="db-notif-header-left">
                                            <span className="material-symbols-outlined db-notif-bell-icon">notifications_active</span>
                                            <h4>Notifications</h4>
                                            {unreadCount > 0 && (
                                                <span className="db-notif-count-chip">{unreadCount} new</span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button className="db-mark-all-btn" onClick={handleMarkAllRead}>
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="db-notification-list">
                                        {notifications.length === 0 ? (
                                            <div className="db-no-notifications">
                                                <span className="material-symbols-outlined db-no-notif-icon">notifications_off</span>
                                                <p>No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div
                                                    key={notif.id}
                                                    className={`db-notification-item ${notif.read ? 'read' : 'unread'}`}
                                                    onClick={() => !notif.read && handleNotificationClick(notif.id)}
                                                >
                                                    <div className="db-notif-icon-wrap">
                                                        <span className="material-symbols-outlined">{getNotificationIcon(notif)}</span>
                                                    </div>
                                                    <div className="db-notification-content">
                                                        <p>{notif.message}</p>
                                                        <span className="db-notification-time">
                                                            {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                        </span>
                                                    </div>
                                                    {!notif.read && <div className="db-notification-dot"></div>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ─── Admin Avatar ─── */}
                        <div className="db-user-profile" onClick={() => scrollToSection('profile')}>
                            <img
                                src={adminData.profilePicture
                                    ? `http://localhost:8080/api/users/profile-image/${adminData.profilePicture}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(adminData.name)}&background=2D4057&color=fff`}
                                alt="Avatar"
                            />
                            <div className="db-user-info">
                                <p className="u-name">{adminData.name}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="db-scroll-container">
                    <section id="overview" className="dashboard-section">
                        <div className="welcome-section section-title">
                            <h1>Super Admin Dashboard</h1>
                        </div>
                        <p className="section-subtitle">Manage operations, users, and oversee platform analytics.</p>

                        <h2 className="section-title" style={{ fontSize: '20px', marginTop: '20px' }}>Dashboard Features</h2>
                        <div className="features-grid">
                            <div className="feature-card" onClick={() => scrollToSection('overview')}>
                                <div className="fc-icon-wrapper fc-color-blue">
                                    <span className="material-symbols-outlined">dashboard</span>
                                </div>
                                <h3 className="fc-title">Overview</h3>
                                <p className="fc-desc">View financial reports and application statistics.</p>
                                <div className="fc-footer"><span className="material-symbols-outlined">analytics</span><span>System Analytics</span></div>
                            </div>

                            <div className="feature-card" onClick={() => scrollToSection('users')}>
                                <div className="fc-icon-wrapper fc-color-green">
                                    <span className="material-symbols-outlined">group</span>
                                </div>
                                <h3 className="fc-title">Manage Users</h3>
                                <p className="fc-desc">View, edit, or remove all registered platform users.</p>
                                <div className="fc-footer"><span className="material-symbols-outlined">manage_accounts</span><span>User Controls</span></div>
                            </div>

                            <div className="feature-card" onClick={() => scrollToSection('profile')}>
                                <div className="fc-icon-wrapper fc-color-dark">
                                    <span className="material-symbols-outlined">admin_panel_settings</span>
                                </div>
                                <h3 className="fc-title">Admin Profile</h3>
                                <p className="fc-desc">Modify your Super Admin settings and avatar.</p>
                                <div className="fc-footer"><span className="material-symbols-outlined">settings</span><span>System Preferences</span></div>
                            </div>
                        </div>

                        <div className="overview-wrapper" style={{ marginTop: '40px' }}>
                            <Overview />
                        </div>
                    </section>

                    <section id="users" className="dashboard-section">
                        <h2 className="section-title">Manage Users</h2>
                        <p className="section-subtitle">View, edit, or remove registered platform users.</p>
                        <ManageUser />
                    </section>

                    <section id="profile" className="dashboard-section">
                        <h2 className="section-title">Admin Profile</h2>
                        <p className="section-subtitle">Modify your Super Admin settings and avatar.</p>
                        <AdminProfile adminData={adminData} setAdminData={setAdminData} />
                    </section>
                </div>
            </main>
        </div>
    );
}
export default Dashboard;