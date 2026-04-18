import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './POProfile.css';
import MapSelectorModal from './MapSelectorModal';

const API_BASE_URL = 'http://localhost:8080/api/users';

const POProfile = ({ user, authToken, onProfileUpdate }) => {
    const [profileData, setProfileData] = useState(user || {});
    const [isEditMode, setIsEditMode] = useState(false);
    const [parkingPlaces, setParkingPlaces] = useState([]);
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [activeMapField, setActiveMapField] = useState(null);

    const fetchParkingPlaces = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (!userId || !token) return;
            const res = await axios.get(`/api/parking/owner/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setParkingPlaces(res.data);
        } catch (err) {
            console.error('Failed to fetch parking places', err);
        }
    };

    useEffect(() => {
        if (user && user.id) {
            setProfileData(user);
            fetchParkingPlaces();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    
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

    
    const openMapForProfile = () => {
        setActiveMapField('profile');
        setMapModalOpen(true);
    };

    const handleMapLocationSelect = (locObj) => {
        if (activeMapField === 'profile') {
            setProfileData({ ...profileData, address: locObj.address });
        }
    };

    const profilePicUrl = profileData.profilePicture 
            ? `http://localhost:8080/api/users/profile-image/${profileData.profilePicture}` 
            : 'https://ui-avatars.com/api/?name=PO';

    return (
        <div className="po-profile-container">
            {}
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

            {}
            <div className="po-content-grid">
                
                {}
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

                <div className="po-panel card-glass locations-panel">
                    <div className="panel-header-row">
                        <h3 className="panel-title">My Parking Places</h3>
                    </div>

                    <div className="panel-body">
                        <div className="locations-list">
                            {parkingPlaces.length === 0 && (
                                <div className="empty-locations">
                                    <span className="material-symbols-outlined">local_parking</span>
                                    <p>No parking places created yet. Go to <strong>My Slots</strong> to add one.</p>
                                </div>
                            )}

                            {parkingPlaces.map(place => (
                                <div className="loc-card" key={place.id}>
                                    <div className="loc-info">
                                        <h4>{place.parkingName}</h4>
                                        <p className="loc-address">
                                            <span className="material-symbols-outlined">location_on</span>
                                            {place.location || place.address || 'No address set'}
                                        </p>
                                        <p className="loc-time">
                                            <span className="material-symbols-outlined">garage</span>
                                            {place.slots} slots &nbsp;|&nbsp;
                                            <span className="material-symbols-outlined">schedule</span>
                                            {place.is24Hours ? '24 Hours' : `${place.openHours} - ${place.closeHours}`}
                                        </p>
                                    </div>
                                    <span className={`loc-badge ${place.type?.toLowerCase()}`}>{place.type}</span>
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
