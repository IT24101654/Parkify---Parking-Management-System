import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './POProfile.css';
import MapSelectorModal from './MapSelectorModal';

const API_BASE_URL = 'http://localhost:8080/api/users';
const LOCATIONS_API_URL = 'http://localhost:8080/api/parking-locations';

const POProfile = ({ user, authToken, onProfileUpdate }) => {
    const [profileData, setProfileData] = useState(user || {});
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Parking Locations State
    const [locations, setLocations] = useState([]);
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', address: '', lat: null, lng: null, availableFrom: '08:00', availableTo: '22:00' });
    
    // UI Modals
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [activeMapField, setActiveMapField] = useState(null); // 'profile' or 'location'

    // Fetch initial Profile & Locations
    useEffect(() => {
        if (user && user.id) {
            setProfileData(user);
            fetchLocations(user.id);
        }
    }, [user]);

    const fetchLocations = async (userId) => {
        try {
            const res = await axios.get(`${LOCATIONS_API_URL}/owner/${userId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLocations(res.data);
        } catch (err) {
            console.error("Failed to fetch parking locations", err);
        }
    };

    // --- Profile Handlers ---
    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${API_BASE_URL}/${profileData.id}/upload-profile-image`, formData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const updatedUser = { ...profileData, profilePicture: res.data.fileName };
            setProfileData(updatedUser);
            if (onProfileUpdate) onProfileUpdate(updatedUser);
            alert("Profile image uploaded successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to upload image.");
        }
    };

    const saveProfileDetails = async () => {
        try {
            const res = await axios.put(`${API_BASE_URL}/${profileData.id}/profile`, {
                name: profileData.name,
                phoneNumber: profileData.phoneNumber,
                address: profileData.address,
                nicNumber: profileData.nicNumber
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setProfileData(res.data);
            if (onProfileUpdate) onProfileUpdate(res.data);
            setIsEditMode(false);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile details.");
        }
    };

    // --- Location Form Handlers ---
    const handleAddLocationSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newLocation.name,
                address: newLocation.address,
                latitude: newLocation.lat,
                longitude: newLocation.lng,
                availableFrom: newLocation.availableFrom,
                availableTo: newLocation.availableTo,
                active: true
            };
            const res = await axios.post(`${LOCATIONS_API_URL}/add/${profileData.id}`, payload, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLocations([...locations, res.data]);
            setIsAddingLocation(false);
            setNewLocation({ name: '', address: '', lat: null, lng: null, availableFrom: '08:00', availableTo: '22:00' });
        } catch (err) {
            console.error(err);
            alert("Failed to add parking location");
        }
    };

    const handleDeleteLocation = async (locId) => {
        if (!window.confirm("Are you sure you want to delete this parking location?")) return;
        try {
            await axios.delete(`${LOCATIONS_API_URL}/${locId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setLocations(locations.filter(l => l.id !== locId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete location.");
        }
    };

    // --- Map Selection Handlers ---
    const openMapForProfile = () => {
        setActiveMapField('profile');
        setMapModalOpen(true);
    };

    const openMapForLocation = () => {
        setActiveMapField('location');
        setMapModalOpen(true);
    };

    const handleMapLocationSelect = (locObj) => {
        if (activeMapField === 'profile') {
            setProfileData({ ...profileData, address: locObj.address });
        } else if (activeMapField === 'location') {
            setNewLocation({ ...newLocation, address: locObj.address, lat: locObj.lat, lng: locObj.lng });
        }
    };

    const profilePicUrl = profileData.profilePicture 
            ? `http://localhost:8080/api/users/profile-image/${profileData.profilePicture}` 
            : 'https://ui-avatars.com/api/?name=PO';

    return (
        <div className="po-profile-container">
            {/* Header Card */}
            <div className="po-profile-header card-glass">
                <div className="header-left">
                    <div className="avatar-wrapper">
                        <img src={profilePicUrl} alt="Profile" className="po-avatar-img" />
                        <label className="avatar-upload-label">
                            <input type="file" hidden accept="image/*" onChange={handleProfileImageUpload} />
                            <span className="material-symbols-outlined">add_a_photo</span>
                        </label>
                    </div>
                    <div className="header-info">
                        <h2>{profileData.name}</h2>
                        <p className="role-chip">Parking Owner</p>
                    </div>
                </div>
                <button className="primary-btn" onClick={() => setIsEditMode(!isEditMode)}>
                    <span className="material-symbols-outlined">{isEditMode ? 'close' : 'edit'}</span>
                    {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
                </button>
            </div>

            {/* Content Split: Profile Details & Parking Locations */}
            <div className="po-content-grid">
                
                {/* Profile Details Panel */}
                <div className="po-panel card-glass">
                    <h3 className="panel-title">Personal Details</h3>
                    <div className="panel-body">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" name="name" 
                                value={profileData.name || ''} 
                                onChange={handleProfileChange}
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" value={profileData.email || ''} disabled className="disabled-input" />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input 
                                type="text" name="phoneNumber" 
                                value={profileData.phoneNumber || ''} 
                                onChange={handleProfileChange}
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="form-group">
                            <label>National ID (NIC)</label>
                            <input 
                                type="text" name="nicNumber" 
                                value={profileData.nicNumber || ''} 
                                onChange={handleProfileChange}
                                disabled={!isEditMode} 
                                placeholder="Enter NIC Number"
                            />
                        </div>
                        <div className="form-group address-group">
                            <label>Primary Address</label>
                            <div className="address-input-wrapper">
                                <input 
                                    type="text" name="address" 
                                    value={profileData.address || ''} 
                                    onChange={handleProfileChange}
                                    disabled={!isEditMode}
                                />
                                {isEditMode && (
                                    <button className="map-btn" type="button" onClick={openMapForProfile} title="Pick from Map">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {isEditMode && (
                            <button className="save-btn" onClick={saveProfileDetails}>Save Profile Details</button>
                        )}
                    </div>
                </div>

                {/* Parking Locations Panel */}
                <div className="po-panel card-glass locations-panel">
                    <div className="panel-header-row">
                        <h3 className="panel-title">My Parking Locations</h3>
                        {!isAddingLocation && (
                            <button className="add-loc-btn" onClick={() => setIsAddingLocation(true)}>
                                <span className="material-symbols-outlined">add</span> Add New Location
                            </button>
                        )}
                    </div>

                    <div className="panel-body">
                        {isAddingLocation && (
                            <form className="add-location-form" onSubmit={handleAddLocationSubmit}>
                                <h4>Register New Parking Place</h4>
                                <div className="form-group">
                                    <label>Location Name (Identifier)</label>
                                    <input type="text" required value={newLocation.name} onChange={e => setNewLocation({...newLocation, name: e.target.value})} placeholder="e.g. City Center Lot B" />
                                </div>
                                <div className="form-group address-group">
                                    <label>Exact Location / Address</label>
                                    <div className="address-input-wrapper">
                                        <input type="text" required value={newLocation.address} onChange={e => setNewLocation({...newLocation, address: e.target.value})} />
                                        <button className="map-btn" type="button" onClick={openMapForLocation}>
                                            <span className="material-symbols-outlined">map</span> Pick
                                        </button>
                                    </div>
                                    {newLocation.lat && <small className="coords-hint">Lat: {newLocation.lat.toFixed(4)}, Lng: {newLocation.lng.toFixed(4)}</small>}
                                </div>
                                
                                <div className="time-row">
                                    <div className="form-group">
                                        <label>Available From</label>
                                        <input type="time" required value={newLocation.availableFrom} onChange={e => setNewLocation({...newLocation, availableFrom: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Available To</label>
                                        <input type="time" required value={newLocation.availableTo} onChange={e => setNewLocation({...newLocation, availableTo: e.target.value})} />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setIsAddingLocation(false)}>Cancel</button>
                                    <button type="submit" className="save-btn">Save Location</button>
                                </div>
                            </form>
                        )}

                        <div className="locations-list">
                            {locations.length === 0 && !isAddingLocation && (
                                <div className="empty-locations">
                                    <span className="material-symbols-outlined">not_listed_location</span>
                                    <p>You haven't listed any parking locations yet.</p>
                                </div>
                            )}

                            {locations.map(loc => (
                                <div className="loc-card" key={loc.id}>
                                    <div className="loc-info">
                                        <h4>{loc.name}</h4>
                                        <p className="loc-address"><span className="material-symbols-outlined">location_on</span> {loc.address}</p>
                                        <p className="loc-time"><span className="material-symbols-outlined">schedule</span> {loc.availableFrom} - {loc.availableTo}</p>
                                    </div>
                                    <button className="loc-delete-btn" onClick={() => handleDeleteLocation(loc.id)} title="Delete Location">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            <MapSelectorModal 
                isOpen={mapModalOpen} 
                onClose={() => setMapModalOpen(false)} 
                onSelectLocation={handleMapLocationSelect} 
            />
        </div>
    );
};

export default POProfile;
