import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    MapContainer, TileLayer, Marker, Popup, Circle, useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './DriverMap.css';
import parkingBg from '../../Assets/parking-bg.jpg';

// ─── Fix Leaflet default icon ────── //
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


const makeIcon = (color, pulse = false) =>
    L.divIcon({
        className: '',
        html: `<div class="dm-marker-pin ${pulse ? 'dm-marker-pulse' : ''}" style="background:${color};">
                 <span class="material-symbols-outlined" style="font-size:14px;color:#fff;">local_parking</span>
               </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -36],
    });

const driverIcon = L.divIcon({
    className: '',
    html: `<div class="dm-driver-dot"><div class="dm-driver-ring"></div></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

//  Haversine distance  //
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

//  Map re-centering helper //
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 14, { animate: true });
    }, [center, map]);
    return null;
}

//  Default center (Colombo) //
const DEFAULT_CENTER = [6.9271, 79.8612];

//  Main Component //
const DriverMap = () => {
    const [parkingPlaces, setParkingPlaces] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [driverPos, setDriverPos] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavorites, setShowFavorites] = useState(false);
    const watchRef = useRef(null);

    useEffect(() => {
        loadData();
        startGPS();
        return () => {
            if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const cfg = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Fetch Parking Places
            let placesData = [];
            try {
                const placesRes = await axios.get('http://localhost:8080/api/parking', cfg);
                placesData = placesRes.data || [];
            } catch (err) {
                console.warn('Failed absolute url, trying relative proxy...', err);
                const placesResProxy = await axios.get('/api/parking', cfg);
                placesData = placesResProxy.data || [];
            }

            // 2. Filter Valid Coordinates
            const valid = placesData.filter(p => p && p.latitude && p.longitude);
            setParkingPlaces(valid);

            // 3. Fetch Favorites (Safe fallthrough)
            try {
                const favRes = await axios.get('http://localhost:8080/api/favorites/my-favorites', cfg);
                console.log('DEBUG: Favorites API response:', favRes.data);
                if (favRes.data && Array.isArray(favRes.data)) {
                    const favIds = favRes.data.map(f => f.parkingSlotId);
                    setFavorites(favIds);
                    console.log('DEBUG: Set favorites state to:', favIds);
                }
            } catch (favErr) {
                const status = favErr.response?.status;
                const errMsg = favErr.response?.data?.error || favErr.message;
                console.warn(`DEBUG: Could not fetch favorites API [Status ${status}]:`, errMsg);
                // Only alert on serious errors, not 401 (handled by login)
                if (status && status !== 401) {
                    alert(`Sync Error: Could not load favorites. ${errMsg}`);
                }
                setFavorites([]);
            }

        } catch (err) {
            console.error('Critical Error loading map data', err);
        }
    };

    //  GPS Tracking //
    const startGPS = useCallback(() => {
        if (!navigator.geolocation) return;
        watchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const loc = [pos.coords.latitude, pos.coords.longitude];
                setDriverPos(loc);
                // Only auto-centre on first fix
                setMapCenter(prev => prev ?? loc);
            },
            (err) => console.warn('GPS error', err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
    }, []);

    //  Filtered places (search & favorites) //
    const filtered = parkingPlaces.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || p.parkingName?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q);
        // Type-safe favoritism check
        const isFavorite = favorites.some(favId => String(favId) === String(p.id));
        const matchesFav = !showFavorites || isFavorite;
        return matchesSearch && matchesFav;
    });

    //  Nearby (<= 1 km) //
    const nearby = driverPos
        ? filtered
            .map(p => ({ ...p, distance: getDistanceKm(driverPos[0], driverPos[1], p.latitude, p.longitude) }))
            .filter(p => p.distance <= 1)
            .sort((a, b) => a.distance - b.distance)
        : [];

    const nearbyIds = new Set(nearby.map(p => p.id));
    //  Favorites toggle //
    const toggleFavorite = async (placeId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to add favorites');
            return;
        }

        const cfg = { headers: { Authorization: `Bearer ${token}` } };
        // Type-safe check
        const isFav = favorites.some(favId => String(favId) === String(placeId));
        
        try {
            if (isFav) {
                await axios.delete(`http://localhost:8080/api/favorites/remove/${placeId}`, cfg);
                setFavorites(f => f.filter(id => String(id) !== String(placeId)));
                alert('Removed from favorites');
            } else {
                await axios.post(`http://localhost:8080/api/favorites/add/${placeId}`, {}, cfg);
                setFavorites(f => [...f, placeId]);
                alert('Added to favorites!');
            }
        } catch (err) { 
            const status = err.response?.status;
            const msg = err.response?.data?.error || err.response?.data || err.message;
            console.error(`Favorite toggle error [${status}]:`, msg);
            alert(`Favorite error (Status ${status || 'Unknown'}): ${msg}`);
        }
    };

    //  Search box   //
    const handleSearch = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (q) {
            const match = parkingPlaces.find(
                p => p.parkingName?.toLowerCase().includes(q.toLowerCase()) ||
                    p.location?.toLowerCase().includes(q.toLowerCase())
            );
            if (match) setMapCenter([match.latitude, match.longitude]);
        }
    };

    /*
    // show massage //
    const showToast = (msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };
    */

    // ── Distance label ────────────────────────────────────────────────────────
    const getDistLabel = (place) => {
        if (!driverPos) return null;
        const d = getDistanceKm(driverPos[0], driverPos[1], place.latitude, place.longitude);
        return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
    };

    const getIcon = (place) => {
        const isFavorite = favorites.some(favId => String(favId) === String(place.id));
        if (isFavorite) return makeIcon('#9b59b6', true); // Purple + Pulse for Favorites
        if (nearbyIds.has(place.id)) return makeIcon('#f39c12'); // Nearby
        if (place.status === 'FULL') return makeIcon('#e74c3c'); // Full
        return makeIcon('#27ae60'); // Available
    };


    return (
        <div className="driver-map-wrapper">

            {/* Search Bar & Toggles */}
            <div className="dm-search-row">
                <div className="dm-search-box">
                    <span className="material-symbols-outlined dm-search-icon">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search parking by name or location..."
                        className="dm-search-input"
                    />
                    {searchQuery && (
                        <button className="dm-search-clear" onClick={() => setSearchQuery('')}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>

                <button
                    className={`dm-show-fav-toggle ${showFavorites ? 'active' : ''}`}
                    onClick={() => setShowFavorites(!showFavorites)}
                >
                    <span className="material-symbols-outlined">
                        {showFavorites ? 'favorite' : 'favorite_border'}
                    </span>
                    {showFavorites ? 'Favorites Only' : 'Show Favorites'}
                </button>

                <div className="dm-legend">
                    <span className="dm-legend-dot" style={{ background: '#27ae60' }}></span><span>Available</span>
                    <span className="dm-legend-dot" style={{ background: '#f39c12' }}></span><span>Nearby</span>
                    <span className="dm-legend-dot" style={{ background: '#e74c3c' }}></span><span>Full</span>
                    <span className="dm-legend-dot dm-driver-legend-dot"></span><span>You</span>
                </div>
            </div>

            {/* ── Nearby Strip ───────────────────────────────────────── */}
            {nearby.length > 0 && (
                <div className="dm-nearby-strip">
                    <p className="dm-nearby-label">
                        <span className="material-symbols-outlined">near_me</span>
                        {nearby.length} nearby spot{nearby.length > 1 ? 's' : ''} within 1 km
                    </p>
                    <div className="dm-nearby-scroll">
                        {nearby.map(p => (
                            <button
                                key={p.id}
                                className="dm-nearby-chip"
                                onClick={() => {
                                    setSelectedPlace(p);
                                    setMapCenter([p.latitude, p.longitude]);
                                }}
                            >
                                <span className="material-symbols-outlined">local_parking</span>
                                <div>
                                    <p className="dm-chip-name">{p.parkingName}</p>
                                    <p className="dm-chip-dist">{(p.distance * 1000).toFixed(0)} m · Rs.{p.price}/hr</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/*  Map  */}
            <div className="dm-map-container">
                <MapContainer
                    center={driverPos || DEFAULT_CENTER}
                    zoom={13}
                    style={{ width: '100%', height: '100%' }}
                    onClick={() => setSelectedPlace(null)}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {mapCenter && <MapController center={mapCenter} />}

                    {/* Driver position */}
                    {driverPos && (
                        <>
                            <Marker position={driverPos} icon={driverIcon} />
                            <Circle
                                center={driverPos}
                                radius={1000}
                                pathOptions={{ color: '#3498db', fillColor: '#3498db', fillOpacity: 0.06, weight: 1.5, dashArray: '6,4' }}
                            />
                        </>
                    )}

                    {/* Parking markers */}
                    {filtered.map(place => (
                        <Marker
                            key={place.id}
                            position={[place.latitude, place.longitude]}
                            icon={getIcon(place)}
                            eventHandlers={{ click: () => setSelectedPlace(place) }}
                        >
                            <Popup className="dm-leaflet-popup">
                                <strong>{place.parkingName}</strong><br />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#A88373' }}>near_me</span>
                                    <span style={{ fontWeight: '800', color: '#A88373' }}>{getDistLabel(place)}</span>
                                </div>
                                <small>{place.location}</small>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* ── Locate Me Button ─────────────────────────────── */}
                {driverPos && (
                    <button className="dm-locate-btn" onClick={() => setMapCenter([...driverPos])}>
                        <span className="material-symbols-outlined">my_location</span>
                    </button>
                )}

                {/* ── Detail Card (floating) ───────────────────────── */}
                {selectedPlace && (
                    <div className="dm-floating-overlay" onClick={(e) => e.stopPropagation()}>
                        <div className="dm-card">
                            {/* Close */}
                            <button className="dm-close-card" onClick={() => setSelectedPlace(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            {/* Header image */}
                            <div className="dm-card-header">
                                <img
                                    src={
                                        selectedPlace.placeImage && selectedPlace.placeImage !== 'null' && selectedPlace.placeImage !== ''
                                            ? `http://localhost:8080/api/parking/image/${selectedPlace.placeImage}`
                                            : parkingBg
                                    }
                                    alt="Parking"
                                    onError={(e) => { e.target.onerror = null; e.target.src = parkingBg; }}
                                />
                                <div className="dm-header-fade" />
                                {/* Favorite */}
                                    <button
                                        className={`dm-fav-btn ${favorites.some(favId => String(favId) === String(selectedPlace.id)) ? 'active' : ''}`}
                                        onClick={() => toggleFavorite(selectedPlace.id)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {favorites.some(favId => String(favId) === String(selectedPlace.id)) ? 'favorite' : 'favorite_border'}
                                        </span>
                                    </button>
                                {/* Nearby badge */}
                                {nearbyIds.has(selectedPlace.id) && (
                                    <div className="dm-nearby-badge">
                                        <span className="material-symbols-outlined">near_me</span>
                                        Nearby
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="dm-card-content">
                                <h3>{selectedPlace.parkingName}</h3>
                                <p className="dm-subtitle">{selectedPlace.type || 'Standard'} Parking</p>

                                <div className="dm-details-grid">
                                    <div className="dm-detail-item">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <div>
                                            <p className="dm-label">Location ( {getDistLabel(selectedPlace)} )</p>
                                            <p className="dm-val">{selectedPlace.location}</p>
                                        </div>
                                    </div>
                                    <div className="dm-detail-item">
                                        <span className="material-symbols-outlined">schedule</span>
                                        <div>
                                            <p className="dm-label">Hours</p>
                                            <p className="dm-val">{selectedPlace.is24Hours ? 'Open 24/7' : `${selectedPlace.openHours} - ${selectedPlace.closeHours}`}</p>
                                        </div>
                                    </div>
                                    <div className="dm-detail-item">
                                        <span className="material-symbols-outlined">payments</span>
                                        <div>
                                            <p className="dm-label">Pricing (Rs.)</p>
                                            <p className="dm-val">Hr: {selectedPlace.price} | Day: {selectedPlace.dailyPrice || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="dm-detail-item">
                                        <span className="material-symbols-outlined">garage</span>
                                        <div>
                                            <p className="dm-label">Capacity</p>
                                            <p className="dm-val">{selectedPlace.slots} Slots</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedPlace.description && (
                                    <p className="dm-description-text" style={{ fontSize: '13px', color: '#7f8c8d', margin: '10px 0' }}>
                                        {selectedPlace.description}
                                    </p>
                                )}

                                {/* Status chip */}
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '15px 0' }}>
                                    <div className={`dm-status-chip ${selectedPlace.status === 'ACTIVE' || !selectedPlace.status ? 'dm-chip-green' : 'dm-chip-red'}`}>
                                        <span className="material-symbols-outlined">circle</span>
                                        {selectedPlace.status || 'ACTIVE'}
                                    </div>
                                    {selectedPlace.weekendAvailable && (
                                        <div className="dm-status-chip dm-chip-blue" style={{ background: '#e3f2fd', color: '#1976d2' }}>
                                            <span className="material-symbols-outlined">calendar_today</span>
                                            Weekend Open
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="dm-action-row" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                    <button
                                        className="dm-book-now-btn"
                                        onClick={() => {
                                            const pkg = {
                                                id: selectedPlace.id,
                                                name: selectedPlace.parkingName,
                                                price: selectedPlace.price
                                            };
                                            localStorage.setItem('pendingReservation', JSON.stringify(pkg));
                                            window.location.href = '/reservation';
                                        }}
                                        style={{
                                            flex: 4,
                                            background: '#D35400',
                                            color: 'white',
                                            border: 'none',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(211, 84, 0, 0.3)',
                                            transition: '0.3s'
                                        }}
                                    >
                                        <span className="material-symbols-outlined">book_online</span>
                                        BOOK NOW
                                    </button>
                                    <button
                                        className={`dm-explicit-fav-btn ${favorites.some(favId => String(favId) === String(selectedPlace.id)) ? 'active' : ''}`}
                                        onClick={() => {
                                            toggleFavorite(selectedPlace.id);
                                            alert('Favorite status updated!');
                                        }}
                                        style={{ 
                                            flex: 1, 
                                            maxWidth: '60px',
                                            background: '#fff', 
                                            borderRadius: '12px', 
                                            border: '1px solid #f1f0e8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            transition: '0.3s'
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ color: favorites.some(favId => String(favId) === String(selectedPlace.id)) ? '#e74c3c' : '#bdc3c7', fontSize: '24px' }}>
                                            {favorites.some(favId => String(favId) === String(selectedPlace.id)) ? 'favorite' : 'favorite_border'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast  */}
        </div>
    );
};

export default DriverMap;
