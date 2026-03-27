import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    MapContainer, TileLayer, Marker, Popup, Circle, useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './DriverMap.css';
import parkingBg from '../../Assets/parking-bg.jpg';

// ─── Fix Leaflet default icon ────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// ─── Custom SVG marker factory ────────────────────────────────────────────────
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

// ─── Haversine distance ───────────────────────────────────────────────────────
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

// ─── Map re-centering helper ──────────────────────────────────────────────────
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 14, { animate: true });
    }, [center, map]);
    return null;
}

// ─── Default center (Colombo) ─────────────────────────────────────────────────
const DEFAULT_CENTER = [6.9271, 79.8612];

// ─── Main Component ───────────────────────────────────────────────────────────
const DriverMap = () => {
    const [parkingPlaces, setParkingPlaces] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [driverPos, setDriverPos] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavorites, setShowFavorites] = useState(false); // New state for favorites filter
    const [toast, setToast] = useState(null);
    const watchRef = useRef(null);

    // ── Load parking places + favorites ──────────────────────────────────────
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
            const [placesRes, favRes] = await Promise.all([
                axios.get('/api/parking', cfg),
                axios.get('/api/favorites/my-favorites', cfg),
            ]);
            const valid = placesRes.data.filter(p => p.latitude && p.longitude);
            setParkingPlaces(valid);
            setFavorites(favRes.data.map(f => f.parkingSlotId));
        } catch (err) {
            console.error('Error loading map data', err);
        }
    };

    // ── GPS Tracking ──────────────────────────────────────────────────────────
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

    // ── Filtered places (search & favorites) ──────────────────────────────────
    const filtered = parkingPlaces.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || p.parkingName?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q);
        const matchesFav = !showFavorites || favorites.includes(p.id);
        return matchesSearch && matchesFav;
    });

    // ── Nearby (<= 1 km) ──────────────────────────────────────────────────────
    const nearby = driverPos
        ? filtered
            .map(p => ({ ...p, distance: getDistanceKm(driverPos[0], driverPos[1], p.latitude, p.longitude) }))
            .filter(p => p.distance <= 1)
            .sort((a, b) => a.distance - b.distance)
        : [];

    const nearbyIds = new Set(nearby.map(p => p.id));

    // ── Determine marker color ────────────────────────────────────────────────
    const getIcon = (place) => {
        const isNearby = nearbyIds.has(place.id);
        if (place.status === 'UNAVAILABLE' || place.slots === 0) return makeIcon('#e74c3c');
        if (isNearby) return makeIcon('#f39c12', true); // orange + pulse
        return makeIcon('#27ae60');
    };

    // ── Favorites toggle ──────────────────────────────────────────────────────
    const toggleFavorite = async (placeId) => {
        const token = localStorage.getItem('token');
        const cfg = { headers: { Authorization: `Bearer ${token}` } };
        const isFav = favorites.includes(placeId);
        try {
            if (isFav) {
                await axios.delete(`/api/favorites/remove/${placeId}`, cfg);
                setFavorites(f => f.filter(id => id !== placeId));
            } else {
                await axios.post(`/api/favorites/add/${placeId}`, {}, cfg);
                setFavorites(f => [...f, placeId]);
            }
        } catch (err) { console.error('Favorite toggle error', err); }
    };

    // ── Search handler ────────────────────────────────────────────────────────
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

    // ── Toast helper ──────────────────────────────────────────────────────────
    const showToast = (msg, type) => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Distance label ────────────────────────────────────────────────────────
    const getDistLabel = (place) => {
        if (!driverPos) return null;
        const d = getDistanceKm(driverPos[0], driverPos[1], place.latitude, place.longitude);
        return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="driver-map-wrapper">

            {/* ── Search Bar & Toggles ─────────────────────────────────────────── */}
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

            {/* ── Map ────────────────────────────────────────────────── */}
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
                                    className={`dm-fav-btn ${favorites.includes(selectedPlace.id) ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(selectedPlace.id)}
                                >
                                    <span className="material-symbols-outlined">
                                        {favorites.includes(selectedPlace.id) ? 'favorite' : 'favorite_border'}
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
                                            <p className="dm-label">Address</p>
                                            <p className="dm-val">{selectedPlace.location}</p>
                                        </div>
                                    </div>
                                    <div className="dm-detail-item">
                                        <span className="material-symbols-outlined">straighten</span>
                                        <div>
                                            <p className="dm-label">Distance</p>
                                            <p className="dm-val">{getDistLabel(selectedPlace) || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="dm-detail-item">
                                        <span className="material-symbols-outlined">payments</span>
                                        <div>
                                            <p className="dm-label">Price</p>
                                            <p className="dm-val">Rs. {selectedPlace.price} / Hr</p>
                                        </div>
                                    </div>
                                    <div className="dm-detail-item">
                                        <span className="material-symbols-outlined">garage</span>
                                        <div>
                                            <p className="dm-label">Slots Left</p>
                                            <p className="dm-val" style={{ color: selectedPlace.slots > 0 ? '#27ae60' : '#e74c3c' }}>
                                                {selectedPlace.slots}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status chip */}
                                <div className={`dm-status-chip ${selectedPlace.status === 'AVAILABLE' || !selectedPlace.status ? 'dm-chip-green' : 'dm-chip-red'}`}>
                                    <span className="material-symbols-outlined">circle</span>
                                    {selectedPlace.status || 'AVAILABLE'}
                                </div>

                                {/* Action buttons */}
                                <div className="dm-action-row" style={{ marginTop: '8px' }}>
                                    <button
                                        className={`dm-explicit-fav-btn ${favorites.includes(selectedPlace.id) ? 'active' : ''}`}
                                        onClick={() => toggleFavorite(selectedPlace.id)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {favorites.includes(selectedPlace.id) ? 'favorite' : 'favorite_border'}
                                        </span>
                                        {favorites.includes(selectedPlace.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Toast ──────────────────────────────────────────────── */}
            {toast && (
                <div className={`dm-toast ${toast.type === 'success' ? 'dm-toast-success' : 'dm-toast-error'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

export default DriverMap;
