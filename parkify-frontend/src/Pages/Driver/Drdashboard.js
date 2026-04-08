import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Drdashboard.css';
import VehicleManagement from './VehicleManagement';
import DrProfile from './DrProfile';
import VoiceWave from './VoiceWave';
import VoiceButton from './VoiceButton';
import DriverMap from './DriverMap';
import InventoryDashboard from '../../Components/Inventory/InventoryDashboard';

// Reusable card for the Overview section
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
    const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/login');
                    return;
                }
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`http://localhost:8080/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Failed to fetch user data', error);
                setUserData({
                    name: localStorage.getItem('userName') || 'Driver Name',
                    email: localStorage.getItem('userEmail') || 'driver@parkify.ai',
                    role: 'DRIVER'
                });
            }
        };

        fetchUserProfile();
    }, [navigate]);


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

    if (!userData) return <div className="loading">Initializing Driver Dashboard...</div>;

    const handlePlaceSelect = (place) => {
        console.log("DEBUG: Driver Dashboard - Selected Parking Place:", place);
        setSelectedPlace(place);
    };

    return (
        <div className="dr-dashboard">
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
                    {(selectedPlace?.hasInventory === true || selectedPlace?.hasInventory === "true") && (
                        <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => scrollToSection('inventory')}>
                            <span className="material-symbols-outlined">inventory</span>
                            <span className="nav-text">Inventory</span>
                        </button>
                    )}
                    {(selectedPlace?.hasServiceCenter === true || selectedPlace?.hasServiceCenter === "true") && (
                        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => scrollToSection('services')}>
                            <span className="material-symbols-outlined">build</span>
                            <span className="nav-text">Vehicle Services</span>
                        </button>
                    )}
                    <button className={activeTab === 'vehicles' ? 'active' : ''} onClick={() => scrollToSection('vehicles')}>
                        <span className="material-symbols-outlined">directions_car</span>
                        <span className="nav-text">Vehicles</span>
                    </button>
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => scrollToSection('profile')}>
                        <span className="material-symbols-outlined">person</span>
                        <span className="nav-text">Profile</span>
                    </button>
                </nav>
                <button className="dr-logout-bottom" onClick={handleLogout}>
                    <span className="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                </button>
            </aside>

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
                            <p className="profile-email">{userData.email}</p>
                        </div>
                        {userData.profilePicture ? (
                            <img src={`http://localhost:8080/api/users/profile-image/${userData.profilePicture}`} alt="Avatar" className="profile-avatar" style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className="profile-avatar">DR</div>
                        )}
                    </div>
                </header>

                <div className="dr-scroll-container">
                    <section id="overview" className="dashboard-section">
                        <div className="overview-header-row" style={{ position: 'relative' }}>
                            <div className="overview-greeting">
                                <h1 className="section-title">Hello, {userData.name.split(' ')[0]}!</h1>
                                <p className="section-subtitle">Ready to find the perfect parking spot today?</p>
                            </div>

                            <div className="voice-widget-container">
                                <VoiceWave isActive={isVoiceAssistantOpen} />
                                <VoiceButton
                                    isListening={isVoiceAssistantOpen}
                                    onClick={() => setIsVoiceAssistantOpen(!isVoiceAssistantOpen)}
                                />
                                {isVoiceAssistantOpen && (
                                    <div className="va-assistant-message">
                                        Hey Driver, how can I help you?
                                    </div>
                                )}
                            </div>
                        </div>

                        <h2 className="section-title" style={{ fontSize: '20px', marginTop: '20px' }}>Dashboard Features</h2>
                        <div className="features-grid">
                            <FeatureCard
                                icon="explore"
                                title="Parking Slots"
                                desc="Search, locate, and smoothly book your ideal parking space across the city."
                                footerIcon="today"
                                footerText="Updated Recently"
                                colorClass="fc-color-blue"
                                onClick={() => scrollToSection('find-slots')}
                            />

                            <FeatureCard
                                icon="book_online"
                                title="Reservations"
                                desc="View your upcoming and past parking reservations with ease."
                                footerIcon="history"
                                footerText="Active Bookings"
                                colorClass="fc-color-green"
                                onClick={() => scrollToSection('my-bookings')}
                            />

                            <FeatureCard
                                icon="account_balance_wallet"
                                title="Payments"
                                desc="Manage transactions, receipts, and preferred payment methods."
                                footerIcon="security"
                                footerText="Secure Wallet"
                                colorClass="fc-color-taupe"
                                onClick={() => scrollToSection('payments')}
                            />

                            <FeatureCard
                                icon="inventory"
                                title="Inventory"
                                desc="Shop and browse available vehicle accessories from nearby centers."
                                footerIcon="shopping_cart"
                                footerText="Shop Now"
                                colorClass="fc-color-rose"
                                visible={selectedPlace?.hasInventory === true || selectedPlace?.hasInventory === "true"}
                                onClick={() => scrollToSection('inventory')}
                            />

                            <FeatureCard
                                icon="build"
                                title="Vehicle Services"
                                desc="Book scheduled maintenance and professional vehicle care."
                                footerIcon="handyman"
                                footerText="Expert Care"
                                colorClass="fc-color-dark"
                                visible={selectedPlace?.hasServiceCenter === true || selectedPlace?.hasServiceCenter === "true"}
                                onClick={() => scrollToSection('services')}
                            />

                            <FeatureCard
                                icon="directions_car"
                                title="My Vehicles"
                                desc="Manage your registered vehicles, view details, and add new ones."
                                footerIcon="garage"
                                footerText="Fleet Management"
                                colorClass="fc-color-green"
                                onClick={() => scrollToSection('vehicles')}
                            />

                            <FeatureCard
                                icon="person"
                                title="My Profile"
                                desc="Adjust your personal details, preferences, and account security."
                                footerIcon="settings"
                                footerText="Manage Settings"
                                colorClass="fc-color-blue"
                                onClick={() => scrollToSection('profile')}
                            />
                        </div>
                    </section>

                    <section id="find-slots" className="dashboard-section">
                        <h2 className="section-title">Find Parking Slots</h2>
                        <p className="section-subtitle">Search and book your ideal parking space.</p>
                        <div className="inner-card">
                            <h3 style={{ marginBottom: '15px' }}>Recommended for you</h3>
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

                    <section id="my-bookings" className="dashboard-section">
                        <h2 className="section-title">Reservations</h2>
                        <p className="section-subtitle">History of your parking reservations.</p>
                        <div className="inner-card">
                            <p style={{ color: 'var(--text-muted)' }}>No recent reservations found.</p>
                        </div>
                    </section>

                    <section id="payments" className="dashboard-section">
                        <h2 className="section-title">Payments</h2>
                        <p className="section-subtitle">Manage your transactions and payment methods.</p>
                        <div className="inner-card">
                            <p style={{ color: 'var(--text-muted)' }}>Payment gateway overview will load here.</p>
                        </div>
                    </section>

                    {(selectedPlace?.hasInventory === true || selectedPlace?.hasInventory === "true") && (
                        <section id="inventory" className="dashboard-section">
                            <InventoryDashboard parkingPlaceId={selectedPlace?.id} />
                        </section>
                    )}

                    {(selectedPlace?.hasServiceCenter === true || selectedPlace?.hasServiceCenter === "true") && (
                        <section id="services" className="dashboard-section">
                            <h2 className="section-title">Vehicle Services</h2>
                            <p className="section-subtitle">Book and track your vehicle maintenance.</p>
                            <div className="inner-card">
                                <p style={{ color: 'var(--text-muted)' }}>Select a nearby service center to book maintenance.</p>
                            </div>
                        </section>
                    )}

                    <section id="vehicles" className="dashboard-section">
                        <VehicleManagement />
                    </section>

                    <section id="profile" className="dashboard-section">
                        <DrProfile
                            user={userData}
                            authToken={localStorage.getItem('token')}
                            onProfileUpdate={(updatedUser) => {
                                setUserData(prev => ({ ...prev, ...updatedUser }));
                            }}
                        />
                    </section>

                </div>
            </main>
        </div>
    );
}

export default Drdashboard;