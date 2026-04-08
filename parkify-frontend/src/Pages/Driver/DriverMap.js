import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    MapContainer, TileLayer, Marker, Circle, useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './DriverMap.css';
import ParkingDetailsCard from '../../Components/Driver/ParkingDetailsCard';

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

const DriverMap = ({ selectedPlace, setSelectedPlace, onViewInventory, onViewServices }) => {
    const [parkingPlaces, setParkingPlaces] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [driverPos, setDriverPos] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavorites, setShowFavorites] = useState(false);
    const watchRef = useRef(null);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('token');
            const cfg = { headers: { Authorization: `Bearer ${token}` } };
            const placesRes = await axios.get('http://localhost:8080/api/parking', cfg);
            const valid = (placesRes.data || []).filter(p => p && p.latitude && p.longitude);
            setParkingPlaces(valid);

            try {
                const favRes = await axios.get('http://localhost:8080/api/favorites/my-favorites', cfg);
                if (favRes.data && Array.isArray(favRes.data)) {
                    setFavorites(favRes.data.map(f => f.parkingSlotId));
                }
            } catch (e) { console.warn('Fav fetch failed', e); }
        } catch (err) { console.error('Data load error', err); }
    };

    const startGPS = useCallback(() => {
        if (!navigator.geolocation) return;
        watchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const loc = [pos.coords.latitude, pos.coords.longitude];
                setDriverPos(loc);
                setMapCenter(prev => prev ?? loc);
            },
            (err) => console.warn('GPS error', err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );
    }, []);

    useEffect(() => {
        loadData();
        startGPS();
        return () => {
            if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
        };
    }, [startGPS]);

    const filtered = parkingPlaces.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || p.parkingName?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q);
        const isFavorite = favorites.some(favId => String(favId) === String(p.id));
        return matchesSearch && (!showFavorites || isFavorite);
    });

    const nearby = driverPos
        ? filtered
            .map(p => ({ ...p, distance: getDistanceKm(driverPos[0], driverPos[1], p.latitude, p.longitude) }))
            .filter(p => p.distance <= 1)
            .sort((a, b) => a.distance - b.distance)
        : [];

    const nearbyIds = new Set(nearby.map(p => p.id));

    const toggleFavorite = async (placeId) => {
        const token = localStorage.getItem('token');
        const cfg = { headers: { Authorization: `Bearer ${token}` } };
        const isFav = favorites.some(favId => String(favId) === String(placeId));
        try {
            if (isFav) {
                await axios.delete(`http://localhost:8080/api/favorites/remove/${placeId}`, cfg);
                setFavorites(f => f.filter(id => String(id) !== String(placeId)));
            } else {
                await axios.post(`http://localhost:8080/api/favorites/add/${placeId}`, {}, cfg);
                setFavorites(f => [...f, placeId]);
            }
        } catch (err) { console.error('Fav toggle error', err); }
    };

    const handleSearch = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (q) {
            const match = parkingPlaces.find(p => p.parkingName?.toLowerCase().includes(q.toLowerCase()));
            if (match) setMapCenter([match.latitude, match.longitude]);
        }
    };

    const getDistLabel = (place) => {
        if (!driverPos) return null;
        const d = getDistanceKm(driverPos[0], driverPos[1], place.latitude, place.longitude);
        return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
    };

    const getIcon = (place) => {
        const isFavorite = favorites.some(favId => String(favId) === String(place.id));
        if (isFavorite) return makeIcon('#9b59b6', true);
        if (nearbyIds.has(place.id)) return makeIcon('#f39c12');
        if (place.status === 'FULL') return makeIcon('#e74c3c');
        return makeIcon('#27ae60');
    };

    return (
        <div className="driver-map-wrapper">
            <div className="dm-search-row">
                <div className="dm-search-box">
                    <span className="material-symbols-outlined dm-search-icon">search</span>
                    <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search parking..." className="dm-search-input" />
                </div>
                <button className={`dm-show-fav-toggle ${showFavorites ? 'active' : ''}`} onClick={() => setShowFavorites(!showFavorites)}>
                    <span className="material-symbols-outlined">{showFavorites ? 'favorite' : 'favorite_border'}</span>
                    {showFavorites ? 'Favorites Only' : 'Show Favorites'}
                </button>
                <div className="dm-legend">
                    <span className="dm-legend-dot" style={{ background: '#27ae60' }}></span><span>Available</span>
                    <span className="dm-legend-dot" style={{ background: '#f39c12' }}></span><span>Nearby</span>
                    <span className="dm-legend-dot" style={{ background: '#e74c3c' }}></span><span>Full</span>
                </div>
            </div>

            {nearby.length > 0 && (
                <div className="dm-nearby-strip">
                    <p className="dm-nearby-label"><span className="material-symbols-outlined">near_me</span>{nearby.length} nearby spots</p>
                    <div className="dm-nearby-scroll">
                        {nearby.map(p => (
                            <button key={p.id} className="dm-nearby-chip" onClick={() => { setSelectedPlace(p); setMapCenter([p.latitude, p.longitude]); }}>
                                <span className="material-symbols-outlined">local_parking</span>
                                <div><p className="dm-chip-name">{p.parkingName}</p><p className="dm-chip-dist">{(p.distance * 1000).toFixed(0)} m</p></div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="dm-map-container" style={{ position: 'relative', height: '600px', borderRadius: '18px', overflow: 'hidden' }}>
                <MapContainer center={driverPos || DEFAULT_CENTER} zoom={13} style={{ width: '100%', height: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                    {mapCenter && <MapController center={mapCenter} />}
                    {driverPos && (
                        <>
                            <Marker position={driverPos} icon={driverIcon} />
                            <Circle center={driverPos} radius={1000} pathOptions={{ color: '#3498db', fillOpacity: 0.06 }} />
                        </>
                    )}
                    {filtered.map(place => (
                        <Marker key={place.id} position={[place.latitude, place.longitude]} icon={getIcon(place)} eventHandlers={{ click: () => setSelectedPlace(place) }} />
                    ))}
                </MapContainer>

                <div
                    className={`dm-map-overlay ${selectedPlace ? 'active' : ''}`}
                    onClick={() => setSelectedPlace(null)}
                />

                <ParkingDetailsCard
                    selectedPlace={selectedPlace}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={selectedPlace && favorites.some(favId => String(favId) === String(selectedPlace.id))}
                    onClose={() => setSelectedPlace(null)}
                    nearbyIds={nearbyIds}
                    getDistLabel={getDistLabel}
                    onViewInventory={onViewInventory}
                    onViewServices={onViewServices}
                />
            </div>
        </div>
    );
};

export default DriverMap;
