import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PODashboard.css';
import ParkingManagement from './ParkingManagement';
import POProfile from './POProfile';

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

    // Intersection Observer for scroll synchronization
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveTab(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -70% 0px' } 
        );
        
        const timeoutId = setTimeout(() => {
            const sections = document.querySelectorAll('.dashboard-section');
            sections.forEach((section) => observer.observe(section));
        }, 300);

        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, [userData]); 

    const scrollToSection = (id) => {
        setActiveTab(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!userData) return <div className="loading">Loading Dashboard...</div>;

    return (
        <div className="po-dashboard">
            {/* Sidebar (Structure untouched) */}
            <aside className="po-sidebar">
                <div className="sidebar-logo">
                    <span className="material-symbols-outlined">directions_car</span>
                    <h1>Parkify</h1>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => scrollToSection('overview')}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="nav-text">Overview</span>
                    </button>
                    <button className={activeTab === 'slots' ? 'active' : ''} onClick={() => scrollToSection('slots')}>
                        <span className="material-symbols-outlined">garage</span>
                        <span className="nav-text">My Slots</span>
                    </button>
                    {userData.hasInventory && (
                        <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => scrollToSection('inventory')}>
                            <span className="material-symbols-outlined">inventory</span>
                            <span className="nav-text">Inventory</span>
                        </button>
                    )}
                    {userData.hasServiceCenter && (
                        <button className={activeTab === 'service' ? 'active' : ''} onClick={() => scrollToSection('service')}>
                            <span className="material-symbols-outlined">build</span>
                            <span className="nav-text">Service Center</span>
                        </button>
                    )}
                    <button className={activeTab === 'earnings' ? 'active' : ''} onClick={() => scrollToSection('earnings')}>
                        <span className="material-symbols-outlined">analytics</span>
                        <span className="nav-text">Earnings</span>
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => scrollToSection('profile')}>
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
                        {userData.profilePicture ? (
                            <img
                                src={`http://localhost:8080/api/users/profile-image/${userData.profilePicture}`}
                                alt="avatar"
                                className="profile-avatar"
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="profile-avatar">PO</div>
                        )}
                    </div>
                </header>

                <div className="po-scroll-container">
                    {/* SECTION: OVERVIEW */}
                    <section id="overview" className="dashboard-section">
                        <div className="welcome-section">
                            <h1 className="section-title">Welcome to your Dashboard</h1>
                            <p className="section-subtitle">Manage your parking spaces and monitor earnings in real-time.</p>
                        </div>



                        <h2 className="section-title" style={{ fontSize: '20px', marginTop: '20px' }}>Dashboard Features</h2>
                        <div className="features-grid">
                            <div className="feature-card" onClick={() => scrollToSection('slots')}>
                                <div className="fc-icon-wrapper fc-color-blue">
                                    <span className="material-symbols-outlined">garage</span>
                                </div>
                                <h3 className="fc-title">My Slots</h3>
                                <p className="fc-desc">Review and manage your listed parking slots availability and pricing.</p>
                                <div className="fc-footer"><span className="material-symbols-outlined">update</span><span>Manage Listings</span></div>
                            </div>

                            {userData.hasInventory && (
                                <div className="feature-card" onClick={() => scrollToSection('inventory')}>
                                    <div className="fc-icon-wrapper fc-color-rose">
                                        <span className="material-symbols-outlined">inventory</span>
                                    </div>
                                    <h3 className="fc-title">Inventory</h3>
                                    <p className="fc-desc">Track and restock vehicle accessories sold at your location.</p>
                                    <div className="fc-footer"><span className="material-symbols-outlined">storefront</span><span>Shop Inventory</span></div>
                                </div>
                            )}

                            {userData.hasServiceCenter && (
                                <div className="feature-card" onClick={() => scrollToSection('service')}>
                                    <div className="fc-icon-wrapper fc-color-green">
                                        <span className="material-symbols-outlined">build</span>
                                    </div>
                                    <h3 className="fc-title">Service Center</h3>
                                    <p className="fc-desc">Manage repair bookings, mechanic assignments, and service history.</p>
                                    <div className="fc-footer"><span className="material-symbols-outlined">handyman</span><span>Manage Services</span></div>
                                </div>
                            )}

                            <div className="feature-card" onClick={() => scrollToSection('earnings')}>
                                <div className="fc-icon-wrapper fc-color-taupe">
                                    <span className="material-symbols-outlined">analytics</span>
                                </div>
                                <h3 className="fc-title">Earnings</h3>
                                <p className="fc-desc">Monitor financial reports, revenue analytics, and withdraw funds.</p>
                                <div className="fc-footer"><span className="material-symbols-outlined">trending_up</span><span>Financial Insights</span></div>
                            </div>

                            <div className="feature-card" onClick={() => scrollToSection('profile')}>
                                <div className="fc-icon-wrapper fc-color-dark">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <h3 className="fc-title">My Profile</h3>
                                <p className="fc-desc">Update your owner profile, billing details, and configurations.</p>
                                <div className="fc-footer"><span className="material-symbols-outlined">settings</span><span>Profile Settings</span></div>
                            </div>
                        </div>
                    </section>


                    <section id="slots" className="dashboard-section">
                        <h2 className="section-title">My Slots</h2>
                        <p className="section-subtitle">Manage your parking slots here.</p>

                        <div className="inner-card" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                            <ParkingManagement />
                        </div>
                    </section>
                    
                    {userData.hasInventory && (
                        <section id="inventory" className="dashboard-section">
                            <h2 className="section-title">Inventory</h2>
                            <p className="section-subtitle">Manage your parking inventory.</p>
                            <div className="inner-card">
                                <p style={{color: 'var(--text-muted)'}}>Inventory management interface will appear here.</p>
                            </div>
                        </section>
                    )}

                    {/* SECTION: SERVICE */}
                    {userData.hasServiceCenter && (
                        <section id="service" className="dashboard-section">
                            <h2 className="section-title">Service Center</h2>
                            <p className="section-subtitle">Manage your vehicle service center.</p>
                            <div className="inner-card">
                                <p style={{color: 'var(--text-muted)'}}>Service center management interface will appear here.</p>
                            </div>
                        </section>
                    )}

                    {/* SECTION: EARNINGS */}
                    <section id="earnings" className="dashboard-section">
                        <h2 className="section-title">Earnings</h2>
                        <p className="section-subtitle">View your earnings and analytics.</p>
                        <div className="inner-card">
                            <p style={{color: 'var(--text-muted)'}}>Reporting graphs and earning analytics will load here.</p>
                        </div>
                    </section>

                    {/* SECTION: PROFILE */}
                    <section id="profile" className="dashboard-section">
                        <h2 className="section-title">My Profile</h2>
                        <p className="section-subtitle">Edit your details, upload a photo, and manage your parking locations.</p>
                        <POProfile
                            user={userData}
                            authToken={localStorage.getItem('token')}
                            onProfileUpdate={(updated) => setUserData(prev => ({ ...prev, ...updated }))}
                        />
                    </section>
                </div>
            </main>
        </div>
    );
}

export default PODashboard;