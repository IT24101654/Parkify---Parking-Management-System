import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Drdashboard.css';
import VehicleManagement from './VehicleManagement';
import DrProfile from './DrProfile';
import VoiceWave from './VoiceWave';
import DriverMap from './DriverMap';
import InventoryDashboard from '../../Components/Inventory/InventoryDashboard';
import ServiceAppointmentDashboard from './ServiceAppointmentDashboard';

/* ─── Reusable Feature Card (same structure as PO Dashboard) ─────────────── */
const FeatureCard = ({ icon, title, desc, footerIcon, footerText, colorClass, onClick, visible = true }) => {
    if (!visible) return null;
    return (
        <div className="feature-card" onClick={onClick}>
            <div className={`fc-icon-wrapper ${colorClass}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3 className="fc-title">{title}</h3>
            <p className="fc-desc">{desc}</p>
            <div className="fc-footer">
                <span className="material-symbols-outlined">{footerIcon}</span>
                <span>{footerText}</span>
            </div>
        </div>
    );
};

function Drdashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    const isProgrammaticScroll = useRef(false);
    const scrollTaskTimeout = useRef(null);
    const scrollContainerRef = useRef(null);

    /* ── Fetch user profile ───────────────────────────────────────────────── */
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                if (!token || !userId) { navigate('/login'); return; }
                const { data } = await axios.get(
                    `http://localhost:8080/api/users/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUserData(data);
            } catch {
                setUserData({
                    name: localStorage.getItem('userName') || 'Driver',
                    email: localStorage.getItem('userEmail') || 'driver@parkify.ai',
                    role: 'DRIVER'
                });
            }
        };
        fetchUser();
    }, [navigate]);

    /* ── IntersectionObserver — same as PO Dashboard ─────────────────────── */
    useEffect(() => {
        if (!scrollContainerRef.current || !userData) return;

        const handleIntersection = (entries) => {
            if (isProgrammaticScroll.current) return;
            let maxRatio = 0;
            let activeId = activeTab;
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    activeId = entry.target.id;
                }
            });
            if (activeId !== activeTab && maxRatio > 0.1) setActiveTab(activeId);
        };

        const observer = new IntersectionObserver(handleIntersection, {
            root: scrollContainerRef.current,
            threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
            rootMargin: '-10% 0px -10% 0px'
        });

        const timeoutId = setTimeout(() => {
            const sections = document.querySelectorAll('.dashboard-section');
            if (sections.length > 0) sections.forEach(s => observer.observe(s));
        }, 1000);

        return () => { observer.disconnect(); clearTimeout(timeoutId); };
    }, [userData, activeTab]);

    /* ── Auto-close voice after 6 s ──────────────────────────────────────── */
    useEffect(() => {
        if (!isVoiceOpen) return;
        const t = setTimeout(() => setIsVoiceOpen(false), 6000);
        return () => clearTimeout(t);
    }, [isVoiceOpen]);

    /* ── Scroll helper (same as PO Dashboard) ────────────────────────────── */
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            isProgrammaticScroll.current = true;
            setActiveTab(id);
            if (scrollTaskTimeout.current) clearTimeout(scrollTaskTimeout.current);
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            scrollTaskTimeout.current = setTimeout(() => {
                isProgrammaticScroll.current = false;
            }, 1200);
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const handlePlaceSelect = (place) => {
        console.log('Driver Dashboard — selected place:', place);
        setSelectedPlace(place);
    };

    if (!userData) return <div className="loading">Loading Dashboard...</div>;

    const firstName = (userData.name || 'Driver').split(' ')[0];
    const hasInventory = selectedPlace?.hasInventory === true || selectedPlace?.hasInventory === 'true';
    const hasService = selectedPlace?.hasServiceCenter === true || selectedPlace?.hasServiceCenter === 'true';

    return (
        <div className="dr-dashboard">

            {/* ════════════ SIDEBAR (mirrors PO Dashboard structure exactly) ════════════ */}
            <aside className="dr-sidebar">
                <div className="sidebar-logo">
                    <span className="material-symbols-outlined">directions_car</span>
                    <h1>Parkify</h1>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => scrollToSection('overview')}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="nav-text">Overview</span>
                    </button>
                    <button className={activeTab === 'find-slots' ? 'active' : ''} onClick={() => scrollToSection('find-slots')}>
                        <span className="material-symbols-outlined">explore</span>
                        <span className="nav-text">Parking Slots</span>
                    </button>
                    <button className={activeTab === 'my-bookings' ? 'active' : ''} onClick={() => scrollToSection('my-bookings')}>
                        <span className="material-symbols-outlined">book_online</span>
                        <span className="nav-text">Reservations</span>
                    </button>
                    <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => scrollToSection('payments')}>
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                        <span className="nav-text">Payments</span>
                    </button>
                    {hasInventory && (
                        <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => scrollToSection('inventory')}>
                            <span className="material-symbols-outlined">inventory</span>
                            <span className="nav-text">Inventory</span>
                        </button>
                    )}
                    {hasService && (
                        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => scrollToSection('services')}>
                            <span className="material-symbols-outlined">build</span>
                            <span className="nav-text">Vehicle Services</span>
                        </button>
                    )}
                    <button className={activeTab === 'vehicles' ? 'active' : ''} onClick={() => scrollToSection('vehicles')}>
                        <span className="material-symbols-outlined">directions_car</span>
                        <span className="nav-text">My Vehicles</span>
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => scrollToSection('profile')}>
                        <span className="material-symbols-outlined">person</span>
                        <span className="nav-text">My Profile</span>
                    </button>
                </nav>
                <button className="dr-logout-bottom" onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                </button>
            </aside>

            {/* ════════════ MAIN ════════════ */}
            <main className="dr-main">

                {/* ── Navbar — same flex structure as PO Dashboard ── */}
                <header className="dr-navbar">
                    {/* Search — same position as PO (left, width 350px) */}
                    <div className="nav-search-wrapper">
                        <div className="nav-search">
                            <span className="material-symbols-outlined">location_on</span>
                            <input type="text" placeholder="Where do you want to park?" />
                        </div>
                    </div>

                    {/* Right side — notifications + profile (matches PO Dashboard exactly) */}
                    <div className="nav-profile">
                        <span className="material-symbols-outlined nav-notification-icon">notifications</span>
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
                            <div className="profile-avatar">DR</div>
                        )}
                    </div>
                </header>

                {/* ── Scroll container — same class pattern as PO Dashboard ── */}
                <div className="dr-scroll-container" ref={scrollContainerRef}>

                    {/* ══════════ OVERVIEW — same structure as PO Dashboard ══════════ */}
                    <section id="overview" className="dashboard-section">
                        {/* Hero heading */}
                        <div className="section-header-row">
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#b26969d4', textAlign: 'center', margin: '0 0 4px 0', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
                                Welcome to your Dashboard
                            </h1>
                        </div>

                        {/* ── Voice Assistant — centered below hero heading ── */}
                        <div className="va-overview-widget">
                            <div className="va-overview-inner">
                                {isVoiceOpen && <VoiceWave isActive={true} />}
                                <button
                                    id="dr-voice-btn"
                                    className={`va-overview-btn ${isVoiceOpen ? 'listening' : ''}`}
                                    onClick={() => setIsVoiceOpen(p => !p)}
                                    title={isVoiceOpen ? 'Stop Voice Assistant' : 'Voice Assistant'}
                                >
                                    <span className="material-symbols-outlined">
                                        {isVoiceOpen ? 'mic_off' : 'mic'}
                                    </span>
                                </button>
                                <p className="va-overview-label">
                                    {isVoiceOpen
                                        ? `Hey ${firstName}, how can I help you?`
                                        : 'Voice Assistant — Click to speak'}
                                </p>
                            </div>
                        </div>

                        {/* Dashboard Features heading */}
                        <div style={{ textAlign: 'center', marginTop: '4px', marginBottom: '8px' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#B08974', margin: '0 0 4px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                Dashboard Features
                            </h2>
                            <p style={{ fontSize: '1.15rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                                Select a category to manage your parking experience
                            </p>
                        </div>

                        {/* Feature cards — same grid + card structure as PO Dashboard */}
                        <div className="features-grid">
                            <FeatureCard
                                icon="explore"
                                title="Parking Slots"
                                desc="Search, locate, and book your ideal parking space across the city with ease."
                                footerIcon="today"
                                footerText="Find Available Slots"
                                colorClass="fc-color-blue"
                                onClick={() => scrollToSection('find-slots')}
                            />
                            <FeatureCard
                                icon="book_online"
                                title="Reservations"
                                desc="View and manage your upcoming and past parking reservations."
                                footerIcon="history"
                                footerText="View Active Bookings"
                                colorClass="fc-color-rose"
                                onClick={() => scrollToSection('my-bookings')}
                            />
                            <FeatureCard
                                icon="account_balance_wallet"
                                title="Payments"
                                desc="Manage transactions, receipts, and your preferred payment methods."
                                footerIcon="security"
                                footerText="Secure Wallet"
                                colorClass="fc-color-green"
                                onClick={() => scrollToSection('payments')}
                            />
                            <FeatureCard
                                icon="inventory"
                                title="Inventory"
                                desc="Shop and browse vehicle accessories from nearby service centers."
                                footerIcon="shopping_cart"
                                footerText="Shop Now"
                                colorClass="fc-color-taupe"
                                visible={hasInventory}
                                onClick={() => scrollToSection('inventory')}
                            />
                            <FeatureCard
                                icon="build"
                                title="Vehicle Services"
                                desc="Book professional maintenance and scheduled vehicle care nearby."
                                footerIcon="handyman"
                                footerText="Expert Care"
                                colorClass="fc-color-dark"
                                visible={hasService}
                                onClick={() => scrollToSection('services')}
                            />
                            <FeatureCard
                                icon="directions_car"
                                title="My Vehicles"
                                desc="Manage your registered vehicles, view details, and add new ones."
                                footerIcon="garage"
                                footerText="Fleet Management"
                                colorClass="fc-color-blue"
                                onClick={() => scrollToSection('vehicles')}
                            />
                            <FeatureCard
                                icon="person"
                                title="My Profile"
                                desc="Update your personal details, preferences, and account security settings."
                                footerIcon="settings"
                                footerText="Profile Settings"
                                colorClass="fc-color-dark"
                                onClick={() => scrollToSection('profile')}
                            />
                        </div>
                    </section>

                    {/* ══════════ FIND PARKING SLOTS ══════════ */}
                    <section id="find-slots" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6F7C80', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                Find Parking Slots
                            </h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                Search and reserve your ideal parking space near you
                            </p>
                        </div>
                        <div className="inner-card">
                            <h3 style={{ marginBottom: '18px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '16px' }}>
                                Recommended Nearby Slots
                            </h3>
                            <div className="driver-map-wrapper-override">
                                <DriverMap
                                    selectedPlace={selectedPlace}
                                    setSelectedPlace={handlePlaceSelect}
                                    onViewInventory={() => scrollToSection('inventory')}
                                    onViewServices={() => scrollToSection('services')}
                                />
                            </div>
                        </div>
                    </section>

                    {/* ══════════ RESERVATIONS ══════════ */}
                    <section id="my-bookings" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#B08974', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                My Reservations
                            </h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                Track your upcoming and past parking bookings
                            </p>
                        </div>
                        <div className="inner-card">
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                No recent reservations found. Book a parking slot to get started.
                            </p>
                        </div>
                    </section>

                    {/* ══════════ PAYMENTS ══════════ */}
                    <section id="payments" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#7A806B', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                Payments
                            </h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                View transactions, receipts, and manage your payment methods
                            </p>
                        </div>
                        <div className="inner-card">
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                Payment gateway overview will load here.
                            </p>
                        </div>
                    </section>

                    {/* ══════════ INVENTORY (conditional) ══════════ */}
                    {hasInventory && (
                        <section id="inventory" className="dashboard-section">
                            <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#7A806B', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                    Inventory
                                </h1>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                    Browse vehicle accessories from nearby service centers
                                </p>
                            </div>
                            <InventoryDashboard parkingPlaceId={selectedPlace?.id} />
                        </section>
                    )}

                    {/* ══════════ VEHICLE SERVICES (conditional) ══════════ */}
                    {hasService && (
                        <section id="services" className="dashboard-section">
                            <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#B08974', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                    Vehicle Services
                                </h1>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                    Book and track your professional vehicle maintenance services
                                </p>
                            </div>
                            <ServiceAppointmentDashboard
                                selectedPlace={selectedPlace}
                                userData={userData}
                            />
                        </section>
                    )}

                    {/* ══════════ MY VEHICLES ══════════ */}
                    <section id="vehicles" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6F7C80', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                My Vehicles
                            </h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                Manage your registered vehicles and fleet details
                            </p>
                        </div>
                        <VehicleManagement />
                    </section>

                    {/* ══════════ MY PROFILE ══════════ */}
                    <section id="profile" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6F7C80', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                My Profile
                            </h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                Manage your personal and account details
                            </p>
                        </div>
                        <DrProfile
                            user={userData}
                            authToken={localStorage.getItem('token')}
                            onProfileUpdate={(updated) =>
                                setUserData(prev => ({ ...prev, ...updated }))
                            }
                        />
                    </section>

                </div>
            </main>
        </div>
    );
}

export default Drdashboard;