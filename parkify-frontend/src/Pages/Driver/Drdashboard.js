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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputValue, setTextInputValue] = useState('');
    
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
                    `/api/users/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUserData(data);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.clear();
                    navigate('/login');
                } else {
                    setUserData('error');
                }
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


    // ── Get FRESH GPS location (4s timeout, falls back to localStorage) ──
    const getFreshLocation = () => new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({
                lat: parseFloat(localStorage.getItem('driverLat')) || 6.9271,
                lng: parseFloat(localStorage.getItem('driverLng')) || 79.8612,
            });
            return;
        }
        const fallbackTimer = setTimeout(() => {
            resolve({
                lat: parseFloat(localStorage.getItem('driverLat')) || 6.9271,
                lng: parseFloat(localStorage.getItem('driverLng')) || 79.8612,
            });
        }, 4000);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                clearTimeout(fallbackTimer);
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                // Update localStorage so rest of app is also fresh
                localStorage.setItem('driverLat', lat);
                localStorage.setItem('driverLng', lng);
                resolve({ lat, lng });
            },
            () => {
                clearTimeout(fallbackTimer);
                resolve({
                    lat: parseFloat(localStorage.getItem('driverLat')) || 6.9271,
                    lng: parseFloat(localStorage.getItem('driverLng')) || 79.8612,
                });
            },
            { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
        );
    });

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

            // ── Always get FRESH GPS before AI call ──────────────
            const { lat, lng } = await getFreshLocation();
            
            const reqPayload = { preferenceType: pref, latitude: lat, longitude: lng, targetEntity: targetEntity };
            
            const res = await axios.post(`/api/ai-assistant/recommend`, reqPayload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data && res.data.data && res.data.data.recommendedPlace) {
                const bestPlace = res.data.data.recommendedPlace;
                setActiveContextPlace(bestPlace);
                
                // Always show the recommended place on the map first
                scrollToSection('find-slots');
                setMapPopupPlace(bestPlace);
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
            // Mobile browsers that don't support speech API → show text input fallback
            setShowTextInput(true);
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
                alert("Microphone Access Blocked! Please allow microphone access in your browser settings.");
            } else if (event.error === 'service-not-allowed' || event.error === 'service_not_allowed') {
                // Mobile browsers (iOS Safari, some Android) block speech recognition
                // Show text input fallback instead
                setShowTextInput(true);
            } else if (event.error === 'no-speech') {
                setShowTextInput(true);
            } else {
                setShowTextInput(true);
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

    const handleTextSearch = async () => {
        const query = textInputValue.trim();
        if (!query) return;
        setShowTextInput(false);
        setTextInputValue('');
        await stopAndProcessVoice(query);
    };

    const getProfileImgUrl = (pic) => {
        if (!pic) return '';
        if (pic.startsWith('http')) return pic;
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        return `${baseUrl}/api/users/profile-image/${pic}`;
    };

    if (userData === 'error') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#6d4242d4', marginBottom: '16px' }}>cloud_off</span>
                <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '8px' }}>Server is waking up or busy</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Please try again in a few moments.</p>
                <button className="primary-btn" onClick={() => window.location.reload()} style={{ padding: '12px 24px', fontSize: '1.1rem', cursor: 'pointer', border: 'none', borderRadius: '8px', background: '#6d4242d4', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined">refresh</span> Retry Now
                </button>
            </div>
        );
    }

    if (!userData) return <div className="loading">Loading Dashboard...</div>;

    const firstName = (userData.name || 'Driver').split(' ')[0];
    const hasInventory = activeContextPlace?.hasInventory === true || activeContextPlace?.hasInventory === 'true';
    const hasService = activeContextPlace?.hasServiceCenter === true || activeContextPlace?.hasServiceCenter === 'true';

    return (
        <div className="dr-dashboard">
            <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

            <aside className={`dr-sidebar ${isSidebarOpen ? 'active' : ''}`}>
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
                    <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => {
                        if (hasInventory) {
                            scrollToSection('inventory');
                        } else {
                            stopAndProcessVoice('find inventory');
                        }
                    }}>
                        <span className="material-symbols-outlined">inventory</span>
                        <span className="nav-text">Inventory</span>
                    </button>
                    <button className={activeTab === 'services' ? 'active' : ''} onClick={() => {
                        if (hasService) {
                            scrollToSection('services');
                        } else {
                            stopAndProcessVoice('near service center');
                        }
                    }}>
                        <span className="material-symbols-outlined">build</span>
                        <span className="nav-text">Vehicle Services</span>
                    </button>
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
                    <div className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </div>
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
                                src={getProfileImgUrl(userData.profilePicture)}
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
                                    {[
                                        { label: 'Nearest parking',    cmd: 'nearest parking',    color: '#B08974', bg: 'rgba(176, 137, 116, 0.1)', border: 'rgba(176, 137, 116, 0.2)' },
                                        { label: 'Cheap parking',      cmd: 'cheap parking',      color: '#B08974', bg: 'rgba(176, 137, 116, 0.1)', border: 'rgba(176, 137, 116, 0.2)' },
                                        { label: 'Near service center', cmd: 'near service center', color: '#7A806B', bg: 'rgba(122, 128, 107, 0.1)', border: 'rgba(122, 128, 107, 0.2)' },
                                        { label: 'Find inventory',     cmd: 'find inventory',     color: '#7A806B', bg: 'rgba(122, 128, 107, 0.1)', border: 'rgba(122, 128, 107, 0.2)' },
                                    ].map(({ label, cmd, color, bg, border }) => (
                                        <button
                                            key={cmd}
                                            onClick={() => {
                                                // Stop any active mic first
                                                if (recognitionRef.current) {
                                                    recognitionRef.current.stop();
                                                    recognitionRef.current = null;
                                                }
                                                if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
                                                setIsVoiceOpen(false);
                                                setVoiceTranscript(cmd);
                                                stopAndProcessVoice(cmd);
                                            }}
                                            disabled={isAiThinking}
                                            title={`Click to try: "${label}"`}
                                            style={{
                                                backgroundColor: bg,
                                                color,
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                border: `1px solid ${border}`,
                                                cursor: isAiThinking ? 'not-allowed' : 'pointer',
                                                fontSize: '0.85rem',
                                                fontFamily: 'Inter, sans-serif',
                                                fontWeight: '500',
                                                transition: 'all 0.18s ease',
                                                opacity: isAiThinking ? 0.5 : 1,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = color;
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = `0 4px 12px ${border}`;
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = bg;
                                                e.currentTarget.style.color = color;
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>touch_app</span>
                                            "{label}"
                                        </button>
                                    ))}
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
                                onClick={() => {
                                    if (hasInventory) {
                                        scrollToSection('inventory');
                                    } else {
                                        stopAndProcessVoice('find inventory');
                                    }
                                }}
                            />
                            <FeatureCard
                                icon="build"
                                title="Vehicle Services"
                                desc="Book professional maintenance and scheduled vehicle care nearby."
                                footerIcon="handyman"
                                footerText="Expert Care"
                                colorClass="fc-color-dark"
                                onClick={() => {
                                    if (hasService) {
                                        scrollToSection('services');
                                    } else {
                                        stopAndProcessVoice('near service center');
                                    }
                                }}
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

            {/* ── Text Input Fallback Modal (for mobile / browsers without Speech API) ── */}
            {showTextInput && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, padding: '20px'
                }} onClick={(e) => e.target === e.currentTarget && setShowTextInput(false)}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '32px',
                        width: '100%', maxWidth: '480px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '14px',
                                background: '#f5f0eb', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#B08974', fontSize: '22px' }}>search</span>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1a202c' }}>AI Parking Search</h3>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#a0aec0' }}>Type what you're looking for</p>
                            </div>
                            <button onClick={() => setShowTextInput(false)} style={{
                                marginLeft: 'auto', background: 'none', border: 'none',
                                fontSize: '22px', cursor: 'pointer', color: '#a0aec0', lineHeight: 1
                            }}>×</button>
                        </div>

                        <input
                            type="text"
                            value={textInputValue}
                            onChange={e => setTextInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleTextSearch()}
                            placeholder="e.g. nearest parking, cheap parking, find inventory..."
                            autoFocus
                            style={{
                                width: '100%', padding: '14px 16px', borderRadius: '12px',
                                border: '2px solid #ede9e3', fontSize: '1rem',
                                fontFamily: 'Inter, sans-serif', outline: 'none',
                                boxSizing: 'border-box', marginBottom: '16px',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#B08974'}
                            onBlur={e => e.target.style.borderColor = '#ede9e3'}
                        />

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                            {['Nearest parking', 'Cheap parking', 'Near service center', 'Find inventory'].map(hint => (
                                <button key={hint} onClick={() => setTextInputValue(hint.toLowerCase())}
                                    style={{
                                        background: '#f5f0eb', color: '#B08974',
                                        border: '1px solid #ddd0c8', borderRadius: '20px',
                                        padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600,
                                        cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                                    }}>
                                    {hint}
                                </button>
                            ))}
                        </div>

                        <button onClick={handleTextSearch} disabled={!textInputValue.trim() || isAiThinking}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px',
                                background: textInputValue.trim() ? '#B08974' : '#e2d9d3',
                                color: 'white', border: 'none', fontSize: '1rem',
                                fontWeight: 700, cursor: textInputValue.trim() ? 'pointer' : 'not-allowed',
                                fontFamily: 'Inter, sans-serif', transition: 'background 0.2s'
                            }}>
                            {isAiThinking ? 'Finding...' : '🔍 Find Parking'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Drdashboard;
