import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PODashboard.css';
import ParkingManagement from './ParkingManagement';
import POProfile from './POProfile';
import InventoryDashboard from '../../Components/Inventory/InventoryDashboard';
import InitializeServiceCenterModal from '../../Components/ServiceCenter/InitializeServiceCenterModal';
import ServiceCenterDashboard from '../../Components/ServiceCenter/ServiceCenterDashboard';

function PODashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [userData, setUserData] = useState(null);
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
    const [currentPlaceForInventory, setCurrentPlaceForInventory] = useState(null);
    const isProgrammaticScroll = useRef(false);
    const scrollTaskTimeout = useRef(null);
    const scrollContainerRef = useRef(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [allParkingPlaces, setAllParkingPlaces] = useState([]);
    const searchRef = useRef(null);
    const searchDebounceRef = useRef(null);

    const fetchUserProfile = useCallback(async () => {
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
    }, [navigate]);

    // Intersection Observer for scroll synchronization
    useEffect(() => {
        if (!scrollContainerRef.current || !userData) return;

        const handleIntersection = (entries) => {
            if (isProgrammaticScroll.current) return;

            // Find the section with the largest intersection ratio
            let maxRatio = 0;
            let activeId = activeTab;

            entries.forEach((entry) => {
                if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    activeId = entry.target.id;
                }
            });

            // If we found a dominant section that is different from current, update it
            if (activeId !== activeTab && maxRatio > 0.1) {
                setActiveTab(activeId);
            }
        };

        const observer = new IntersectionObserver(handleIntersection, {
            root: scrollContainerRef.current,
            threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0], // Multiple thresholds for smoother detection
            rootMargin: '-10% 0px -10% 0px'
        });

        // Small delay to ensure all components have rendered their final height
        const timeoutId = setTimeout(() => {
            const sections = document.querySelectorAll('.dashboard-section');
            if (sections.length > 0) {
                sections.forEach((section) => observer.observe(section));
            }
        }, 1000);

        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, [userData, activeTab]); // Include activeTab to stay in sync

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            isProgrammaticScroll.current = true;
            setActiveTab(id);

            if (scrollTaskTimeout.current) clearTimeout(scrollTaskTimeout.current);

            element.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Re-enable observer after animation finishes
            scrollTaskTimeout.current = setTimeout(() => {
                isProgrammaticScroll.current = false;
            }, 1200);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleAddInventory = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/users/${userData.id}/features`, { hasInventory: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserProfile();
            scrollToSection('inventory');
        } catch (error) {
            console.error('Failed to add inventory', error);
        }
    };

    const handleCreateServiceCenter = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            // 1. Create Service Center object with all new fields
            await axios.post('/api/service-centers/save', {
                ...formData,
                user: { id: userData.id },
                active: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 2. Enable flag on user
            await axios.put(`/api/users/${userData.id}/features`, { hasServiceCenter: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsFeatureModalOpen(false);
            fetchUserProfile();
            setTimeout(() => scrollToSection('service'), 500);
        } catch (error) {
            console.error('Failed to create service center', error);
            const errorMsg = error.response?.data?.message || 'Failed to create Service Center. Please try again.';
            alert(`Error: ${errorMsg}`);
        }
    };

    const handleRemoveFeature = async (feature) => {
        if (!window.confirm(`Are you sure you want to remove the ${feature} feature? Your data will be hidden but not deleted.`)) return;
        try {
            const token = localStorage.getItem('token');
            const payload = feature === 'inventory' ? { hasInventory: false } : { hasServiceCenter: false };
            await axios.put(`/api/users/${userData.id}/features`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserProfile();
            scrollToSection('overview');
        } catch (error) {
            console.error(`Failed to remove ${feature}`, error);
        }
    };

    const handleManageInventory = (place) => {
        setCurrentPlaceForInventory(place);
        scrollToSection('inventory');
    };

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // Fetch parking places for search once userData is ready
    const fetchParkingPlacesForSearch = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (!token || !userId) return;
            const res = await axios.get(`/api/parking/owner/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllParkingPlaces(res.data || []);
        } catch (err) {
            console.error('Failed to load parking places for search:', err);
        }
    }, []);

    useEffect(() => {
        if (userData) fetchParkingPlacesForSearch();
    }, [userData, fetchParkingPlacesForSearch]);

    // Debounced real-time search
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        if (!val.trim()) {
            setSearchResults([]);
            setIsSearchOpen(false);
            return;
        }
        setIsSearchLoading(true);
        setIsSearchOpen(true);
        searchDebounceRef.current = setTimeout(() => {
            const q = val.trim().toLowerCase();
            const filtered = allParkingPlaces.filter(p =>
                (p.parkingName || '').toLowerCase().includes(q) ||
                (p.location || '').toLowerCase().includes(q) ||
                (p.city || '').toLowerCase().includes(q) ||
                (p.address || '').toLowerCase().includes(q) ||
                (p.type || '').toLowerCase().includes(q)
            );
            setSearchResults(filtered);
            setIsSearchLoading(false);
        }, 280);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsSearchOpen(false);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const handleSearchResultClick = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        scrollToSection('slots');
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const highlightMatch = useMemo(() => (text, query) => {
        if (!query || !text) return text;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <mark style={{ background: '#fef08a', borderRadius: '2px', padding: '0 1px', fontWeight: 700 }}>
                    {text.slice(idx, idx + query.length)}
                </mark>
                {text.slice(idx + query.length)}
            </>
        );
    }, []);

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
                    {userData.hasInventory ? (
                        <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => scrollToSection('inventory')}>
                            <span className="material-symbols-outlined">inventory</span>
                            <span className="nav-text">Inventory</span>
                        </button>
                    ) : (
                        <button className="sidebar-add-btn" onClick={() => handleAddInventory()}>
                            <span className="material-symbols-outlined">add_circle</span>
                            <span className="nav-text">Add Inventory</span>
                        </button>
                    )}
                    {userData.hasServiceCenter ? (
                        <button className={activeTab === 'service' ? 'active' : ''} onClick={() => scrollToSection('service')}>
                            <span className="material-symbols-outlined">build</span>
                            <span className="nav-text">Service Center</span>
                        </button>
                    ) : (
                        <button className="sidebar-add-btn" onClick={() => { setIsFeatureModalOpen(true); }}>
                            <span className="material-symbols-outlined">add_circle</span>
                            <span className="nav-text">Add Service</span>
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
                    <div className="nav-search-wrapper" ref={searchRef}>
                        <div className={`nav-search${isSearchOpen ? ' nav-search--active' : ''}`}>
                            <span className={`material-symbols-outlined${isSearchLoading ? ' search-spin' : ''}`}>search</span>
                            <input
                                type="text"
                                placeholder="Search parking places..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyDown}
                                onFocus={() => searchQuery && setIsSearchOpen(true)}
                            />
                            {searchQuery && (
                                <button className="search-clear-btn" onClick={clearSearch} aria-label="Clear">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            )}
                        </div>

                        {isSearchOpen && (
                            <div className="search-dropdown">
                                {isSearchLoading ? (
                                    <div className="search-state">
                                        <span className="material-symbols-outlined search-spin">autorenew</span>
                                        <span>Searching...</span>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="search-state">
                                        <span className="material-symbols-outlined">search_off</span>
                                        <span>No results for <strong>"{searchQuery}"</strong></span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="search-dropdown-header">
                                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                        </div>
                                        {searchResults.map((place) => (
                                            <div
                                                key={place.id}
                                                className="search-result-item"
                                                onClick={() => handleSearchResultClick(place)}
                                            >
                                                <div className="search-result-icon">
                                                    <span className="material-symbols-outlined">local_parking</span>
                                                </div>
                                                <div className="search-result-info">
                                                    <div className="search-result-name">
                                                        {highlightMatch(place.parkingName, searchQuery)}
                                                    </div>
                                                    <div className="search-result-meta">
                                                        {place.location && (
                                                            <span>
                                                                <span className="material-symbols-outlined" style={{ fontSize: '13px', verticalAlign: 'middle' }}>location_on</span>
                                                                {highlightMatch(place.location, searchQuery)}
                                                            </span>
                                                        )}
                                                        {place.type && (
                                                            <span className="search-badge">{place.type}</span>
                                                        )}
                                                        {place.price && (
                                                            <span className="search-badge search-badge--price">Rs. {place.price}/hr</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="material-symbols-outlined search-result-arrow">chevron_right</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
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

                <div className="po-scroll-container" ref={scrollContainerRef}>
                    {/* SECTION: OVERVIEW */}
                    <section id="overview" className="dashboard-section">
                        <div className="section-header-row">
                            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: '#6d4242d4', textAlign: 'center', margin: '0 0 10px 0', letterSpacing: '-1px', lineHeight: '1.1' }}>Welcome to your Dashboard</h1>
                        </div>



                        <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '14px' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#B08974', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>Dashboard Features</h2>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>Select a category to manage your parking operations</p>
                        </div>
                        <div className="features-grid">
                            <div className="feature-card" onClick={() => scrollToSection('slots')}>
                                <div className="fc-icon-wrapper fc-color-blue">
                                    <span className="material-symbols-outlined">garage</span>
                                </div>
                                <h3 className="fc-title">My Slots</h3>
                                <p className="fc-desc">Review and manage your listed parking slots availability and pricing.</p>
                                <div className="fc-footer"><span className="material-symbols-outlined">manage_history</span><span>Manage Listings</span></div>
                            </div>

                            {userData.hasInventory ? (
                                <div className="feature-card" onClick={() => scrollToSection('inventory')}>
                                    <div className="fc-icon-wrapper fc-color-rose">
                                        <span className="material-symbols-outlined">inventory</span>
                                    </div>
                                    <h3 className="fc-title">Inventory</h3>
                                    <p className="fc-desc">Track and restock vehicle accessories sold at your location.</p>
                                    <div className="fc-footer"><span className="material-symbols-outlined">storefront</span><span>Shop Inventory</span></div>
                                </div>
                            ) : (
                                <div className="feature-card add-card" onClick={() => handleAddInventory()}>
                                    <div className="fc-icon-wrapper fc-color-rose add-icon">
                                        <span className="material-symbols-outlined">add</span>
                                    </div>
                                    <h3 className="fc-title">Add Inventory</h3>
                                    <p className="fc-desc">Start selling vehicle accessories and spare parts at your parking location.</p>
                                    <div className="fc-footer"><span className="material-symbols-outlined">auto_awesome</span><span>Enable Feature</span></div>
                                </div>
                            )}

                            {userData.hasServiceCenter ? (
                                <div className="feature-card" onClick={() => scrollToSection('service')}>
                                    <div className="fc-icon-wrapper fc-color-green">
                                        <span className="material-symbols-outlined">build</span>
                                    </div>
                                    <h3 className="fc-title">Service Center</h3>
                                    <p className="fc-desc">Manage repair bookings, mechanic assignments, and service history.</p>
                                    <div className="fc-footer"><span className="material-symbols-outlined">handyman</span><span>Manage Services</span></div>
                                </div>
                            ) : (
                                <div className="feature-card add-card" onClick={() => setIsFeatureModalOpen(true)}>
                                    <div className="fc-icon-wrapper fc-color-green add-icon">
                                        <span className="material-symbols-outlined">add</span>
                                    </div>
                                    <h3 className="fc-title">Add Service Center</h3>
                                    <p className="fc-desc">Provide vehicle maintenance and repair services to your customers.</p>
                                    <div className="fc-footer"><span className="material-symbols-outlined">auto_awesome</span><span>Enable Feature</span></div>
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
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6F7C80', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>Parking Slots Management</h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>Manage your parking spaces and availability</p>
                        </div>

                        <div className="inner-card" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                            <ParkingManagement onManageInventory={handleManageInventory} />
                        </div>
                    </section>

                    {/* SECTION: INVENTORY */}
                    {userData.hasInventory && (
                        <section id="inventory" className="dashboard-section">
                            <div style={{ position: 'relative', textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#7A806B', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>Inventory Management</h1>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>Select a category to manage</p>
                                <button className="remove-feature-btn" onClick={() => handleRemoveFeature('inventory')}>
                                    <span className="material-symbols-outlined">delete_forever</span>
                                    Remove Inventory
                                </button>
                            </div>
                            <InventoryDashboard parkingPlaceId={currentPlaceForInventory?.id} />
                        </section>
                    )}

                    {/* SECTION: SERVICE */}
                    {userData.hasServiceCenter && (
                        <section id="service" className="dashboard-section">
                            <div style={{ position: 'relative', textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#B08974', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>Service Management</h1>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>Select a category to manage your services</p>
                                <button className="remove-feature-btn" onClick={() => handleRemoveFeature('service')}>
                                    <span className="material-symbols-outlined">delete_forever</span>
                                    Remove Service Center
                                </button>
                            </div>
                            <div className="inner-card" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
                                <ServiceCenterDashboard userId={userData.id} activeTab={activeTab} />
                            </div>
                        </section>
                    )}

                    {/* SECTION: EARNINGS */}
                    <section id="earnings" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#7A806B', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>Earnings Overview</h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>Track your income and performance</p>
                        </div>
                        <div className="features-grid">
                            <div className="feature-card" style={{ cursor: 'default', minHeight: 'auto' }}>
                                <div className="fc-icon-wrapper" style={{ background: '#f5f5f0', color: 'var(--accent-green)' }}>
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <h3 className="fc-title">Total Revenue</h3>
                                <p className="fc-desc" style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-green)' }}>LKR 0.00</p>
                                <div className="fc-footer"><span>Updated Just Now</span></div>
                            </div>
                            <div className="feature-card" style={{ cursor: 'default', minHeight: 'auto' }}>
                                <div className="fc-icon-wrapper" style={{ background: '#f8f4f2', color: 'var(--accent-rose)' }}>
                                    <span className="material-symbols-outlined">pending_actions</span>
                                </div>
                                <h3 className="fc-title">Pending Bookings</h3>
                                <p className="fc-desc" style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-rose)' }}>0</p>
                                <div className="fc-footer"><span>Awaiting Confirmation</span></div>
                            </div>
                            <div className="feature-card" style={{ cursor: 'default', minHeight: 'auto' }}>
                                <div className="fc-icon-wrapper" style={{ background: '#f0f3f5', color: 'var(--accent-blue)' }}>
                                    <span className="material-symbols-outlined">group</span>
                                </div>
                                <h3 className="fc-title">Total Customers</h3>
                                <p className="fc-desc" style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-blue)' }}>0</p>
                                <div className="fc-footer"><span>Total Reach</span></div>
                            </div>
                        </div>
                        <div className="feature-card" style={{ marginTop: '20px', minHeight: '300px', justifyContent: 'center', alignItems: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--bg-secondary)', marginBottom: '15px' }}>bar_chart</span>
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Analytics and reporting graphs will appear here once you have booking data.</p>
                        </div>
                    </section>

                    {/* SECTION: PROFILE */}
                    <section id="profile" className="dashboard-section">
                        <div style={{ textAlign: 'center', marginBottom: '14px', paddingTop: '4px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6F7C80', margin: '0 0 6px 0', letterSpacing: '-0.5px', lineHeight: '1.15' }}>Profile Management</h1>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', color: '#9C8C79', margin: '0 0 14px 0', lineHeight: '1.5' }}>Manage your personal and account details</p>
                        </div>
                        <POProfile
                            user={userData}
                            authToken={localStorage.getItem('token')}
                            onProfileUpdate={(updated) => setUserData(prev => ({ ...prev, ...updated }))}
                        />
                    </section>
                </div>
            </main>

            {/* FEATURE MODAL */}
            {/* FEATURE MODAL */}
            <InitializeServiceCenterModal
                isOpen={isFeatureModalOpen}
                onClose={() => setIsFeatureModalOpen(false)}
                onSubmit={handleCreateServiceCenter}
            />
        </div>
    );
}

export default PODashboard;