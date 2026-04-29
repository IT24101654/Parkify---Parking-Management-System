import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Drdashboard.css';
import VehicleManagement from './VehicleManagement';
import DrProfile from './DrProfile';
import VoiceWave from './VoiceWave';
import DriverMap from './DriverMap';
import InventoryDashboard from '../../Components/Inventory/InventoryDashboard';
import ServiceAppointmentDashboard from './ServiceAppointmentDashboard';
import ReservationManagement from '../../Components/Driver/ReservationManagement';
import CheckoutPayment from '../../Components/Driver/CheckoutPayment';
import TransactionHistory from '../../Components/Driver/TransactionHistory';

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
    const [mapPopupPlace, setMapPopupPlace] = useState(null);
    const [activeContextPlace, setActiveContextPlace] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [pendingBooking, setPendingBooking] = useState(null);
    const [autoOpenResv, setAutoOpenResv] = useState(false);
    
    const [checkoutReservationId, setCheckoutReservationId] = useState(null);
    
    const isProgrammaticScroll = useRef(false);
    const scrollTaskTimeout = useRef(null);
    const scrollContainerRef = useRef(null);
    const voiceTimeoutRef = useRef(null);
    const recognitionRef = useRef(null);

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


    const stopAndProcessVoice = async (finalTranscript) => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        
        if (!finalTranscript || finalTranscript.trim() === '') {
            setIsVoiceOpen(false);
            return;
        }

        let defaultPref = localStorage.getItem('driverPreferences'); 
        let pref = 'BALANCED';
        if (defaultPref === 'cheap') pref = 'CHEAPEST';
        else if (defaultPref === 'near') pref = 'NEAREST';
        else if (defaultPref === 'avail') pref = 'MOST_AVAILABLE';

        if (finalTranscript.includes('cheap') || finalTranscript.includes('price')) pref = 'CHEAPEST';
        else if (finalTranscript.includes('near') || finalTranscript.includes('close') || finalTranscript.includes('around')) pref = 'NEAREST';
        else if (finalTranscript.includes('available') || finalTranscript.includes('empty') || finalTranscript.includes('space')) pref = 'MOST_AVAILABLE';
        
        let targetEntity = 'PARKING';
        if (finalTranscript.includes('inventory') || finalTranscript.includes('shop') || finalTranscript.includes('item') || finalTranscript.includes('buy') || finalTranscript.includes('accessories')) {
            targetEntity = 'INVENTORY';
        } else if (finalTranscript.includes('service') || finalTranscript.includes('repair') || finalTranscript.includes('maintenance') || finalTranscript.includes('wash')) {
            targetEntity = 'SERVICE';
        }

        setIsVoiceOpen(false);
        try {
            setIsAiThinking(true);
            const token = localStorage.getItem('token');
            
            let lat = parseFloat(localStorage.getItem('driverLat')) || 6.9271;
            let lng = parseFloat(localStorage.getItem('driverLng')) || 79.8612;
            
            const reqPayload = { preferenceType: pref, latitude: lat, longitude: lng, targetEntity: targetEntity };
            
            const res = await axios.post(`http://localhost:8080/api/ai-assistant/recommend`, reqPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data && res.data.data && res.data.data.recommendedPlace) {
                const bestPlace = res.data.data.recommendedPlace;
                setActiveContextPlace(bestPlace);
                
                if (targetEntity === 'INVENTORY') {
                    scrollToSection('inventory');
                } else if (targetEntity === 'SERVICE') {
                    scrollToSection('services');
                } else {
                    scrollToSection('find-slots');
                    setMapPopupPlace(bestPlace);
                }
            }
        } catch (err) {
            console.error("AI Assistant Error:", err);
            alert("AI couldn't find a parking place right now.");
        } finally {
            setIsAiThinking(false);
        }
    };

    const startVoiceAssistant = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Your browser does not support Voice Recognition.');
            return;
        }
        
        if (isVoiceOpen && recognitionRef.current) {
            if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
            stopAndProcessVoice(voiceTranscript);
            return;
        }

        setIsVoiceOpen(true);
        setVoiceTranscript('');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript;
            }
            const cleanTranscript = fullTranscript.toLowerCase().trim();
            setVoiceTranscript(cleanTranscript);

            if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
            voiceTimeoutRef.current = setTimeout(() => {
                stopAndProcessVoice(cleanTranscript);
            }, 2500); 
        };

        recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            if (event.error === 'not-allowed') {
                alert("Microphone Access Blocked! Please click the Site Settings icon next to localhost:3000 in your browser URL bar, and allow Microphone access.");
            } else if (event.error === 'no-speech') {
                alert("No speech detected. Please check if your microphone is working properly.");
            } else {
                alert("Speech error: " + event.error);
            }
            setIsVoiceOpen(false);
            setVoiceTranscript('');
            if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
        };

        recognition.onend = () => {
            if (isVoiceOpen && !isAiThinking && !voiceTimeoutRef.current) {
                setIsVoiceOpen(false);
            }
        };

        recognition.start();
        
        voiceTimeoutRef.current = setTimeout(() => {
            stopAndProcessVoice('');
        }, 8000);
    };

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
        setMapPopupPlace(place);
        if (place) setActiveContextPlace(place);
    };

    const handleBookNow = useCallback((place) => {
        setPendingBooking(place);
        setMapPopupPlace(null);
        if (place) setActiveContextPlace(place);
        setTimeout(() => {
            setAutoOpenResv(true);
            scrollToSection('my-bookings');
        }, 350);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFormOpenHandled = useCallback(() => {
        setAutoOpenResv(false);
    }, []);

    if (!userData) return <div className="loading">Loading Dashboard...</div>;

    const firstName = (userData.name || 'Driver').split(' ')[0];
    const hasInventory = activeContextPlace?.hasInventory === true || activeContextPlace?.hasInventory === 'true';
    const hasService = activeContextPlace?.hasServiceCenter === true || activeContextPlace?.hasServiceCenter === 'true';

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

            <main className="dr-main">

                <header className="dr-navbar">
                    <div className="nav-search-wrapper">
                        <div className="nav-search">
                            <span className="material-symbols-outlined">location_on</span>
                            <input type="text" placeholder="Where do you want to park?" />
                        </div>
                    </div>

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

                <div className="dr-scroll-container" ref={scrollContainerRef}>

                    <section id="overview" className="dashboard-section">
                        <div className="section-header-row">
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#b26969d4', textAlign: 'center', margin: '0 0 4px 0', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
                                Welcome to your Dashboard
                            </h1>
                        </div>

                        <div className="va-overview-widget">
                            <div className="va-overview-inner">
                                {(isVoiceOpen || isAiThinking) && <VoiceWave isActive={true} />}
                                <button
                                    id="dr-voice-btn"
                                    className={`va-overview-btn ${(isVoiceOpen || isAiThinking) ? 'listening' : ''}`}
                                    onClick={startVoiceAssistant}
                                    title={isVoiceOpen ? 'Listening...' : 'Voice Assistant'}
                                >
                                    <span className="material-symbols-outlined">
                                        {isVoiceOpen ? 'mic_off' : 'mic'}
                                    </span>
                                </button>
                                <p className="va-overview-label">
                                    {isAiThinking
                                        ? `Selecting best option...`
                                        : isVoiceOpen 
                                            ? (voiceTranscript ? `"${voiceTranscript}"` : `Listening...`) 
                                            : 'Voice Assistant — Click to speak'}
                                </p>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '14px', fontSize: '0.85rem', maxWidth: '600px', margin: '14px auto 0' }}>
                                    <span style={{ color: '#9C8C79', display: 'flex', alignItems: 'center', fontWeight: '500' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '4px', color: '#B08974' }}>lightbulb</span>
                                        Try saying:
                                    </span>
                                    <span style={{ backgroundColor: 'rgba(176, 137, 116, 0.1)', color: '#B08974', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(176, 137, 116, 0.2)' }}>"Nearest parking"</span>
                                    <span style={{ backgroundColor: 'rgba(176, 137, 116, 0.1)', color: '#B08974', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(176, 137, 116, 0.2)' }}>"Cheap parking"</span>
                                    <span style={{ backgroundColor: 'rgba(176, 137, 116, 0.1)', color: '#7A806B', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(122, 128, 107, 0.2)' }}>"Near service center"</span>
                                    <span style={{ backgroundColor: 'rgba(176, 137, 116, 0.1)', color: '#7A806B', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(122, 128, 107, 0.2)' }}>"Find inventory"</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '4px', marginBottom: '8px' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#B08974', margin: '0 0 4px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                Dashboard Features
                            </h2>
                            <p style={{ fontSize: '1.15rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                                Select a category to manage your parking experience
                            </p>
                        </div>

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

                    <section id="find-slots" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6F7C80', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                Find Parking Slots
                            </h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                Search and reserve your ideal parking space near you
                            </p>
                        </div>
                        <div className="inner-card" style={{ background: 'transparent', padding: '0', boxShadow: 'none', maxWidth: '1200px', margin: '0 auto' }}>
                            <h3 style={{ marginBottom: '16px', fontWeight: 700, color: '#1a202c', fontSize: '18px', paddingLeft: '4px' }}>
                                Recommended Nearby Slots
                            </h3>
                            <div className="driver-map-wrapper-override">
                                <DriverMap
                                    selectedPlace={mapPopupPlace}
                                    setSelectedPlace={handlePlaceSelect}
                                    onViewInventory={() => {
                                        setMapPopupPlace(null);
                                        setTimeout(() => scrollToSection('inventory'), 300);
                                    }}
                                    onViewServices={() => {
                                        setMapPopupPlace(null);
                                        setTimeout(() => scrollToSection('services'), 300);
                                    }}
                                    onBookNow={handleBookNow}
                                />
                            </div>
                        </div>
                    </section>

                    <section id="my-bookings" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#A17060', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                My Reservations
                            </h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                Track your upcoming and past parking bookings
                            </p>
                        </div>
                        <div className="inner-card" style={{ minHeight: 'auto', background: 'transparent', boxShadow: 'none', padding: '0' }}>
                            <ReservationManagement
                                userData={userData}
                                prefillData={pendingBooking}
                                autoOpenForm={autoOpenResv}
                                onFormOpenHandled={handleFormOpenHandled}
                                onNavigateToPayment={(resId) => {
                                    setCheckoutReservationId(resId);
                                    scrollToSection('payments');
                                }}
                            />
                        </div>
                    </section>

                    <section id="payments" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#7A806B', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>
                                Payments
                            </h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                                View transactions, receipts, and manage your payment methods
                            </p>
                        </div>
                        <div className="inner-card" style={{ minHeight: 'auto', background: 'transparent', boxShadow: 'none', padding: '0' }}>
                            {checkoutReservationId ? (
                                <CheckoutPayment 
                                    reservationId={checkoutReservationId} 
                                    onCancel={() => setCheckoutReservationId(null)} 
                                />
                            ) : (
                                <TransactionHistory />
                            )}
                        </div>
                    </section>

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
                            <InventoryDashboard parkingPlaceId={activeContextPlace?.id} />
                        </section>
                    )}

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
                                selectedPlace={activeContextPlace}
                                userData={userData}
                            />
                        </section>
                    )}

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