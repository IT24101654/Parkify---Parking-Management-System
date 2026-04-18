import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DrProfile.css';

const API_BASE_URL = 'http://localhost:8080/api/users';
const VEHICLES_API_URL = 'http://localhost:8080/api/vehicles';

const DrProfile = ({ user, authToken, onProfileUpdate }) => {
    const [profileData, setProfileData] = useState(user || {});
    const [isEditMode, setIsEditMode] = useState(false);

    const [vehicles, setVehicles] = useState([]);
    const [isAddingVehicle, setIsAddingVehicle] = useState(false);
    const [editingVehicleId, setEditingVehicleId] = useState(null);
    const [newVehicle, setNewVehicle] = useState({ vehicleNumber: '', brand: '', model: '', type: 'Car', fuelType: 'Petrol' });
    const [vImage, setVImage] = useState(null);
    const [lImage, setLImage] = useState(null);

    const storedTypes = JSON.parse(localStorage.getItem("selectedVehicles")) || ['Car', 'Bike', 'Van'];

    useEffect(() => {
        const userId = user?.id || localStorage.getItem('userId');
        if (userId) {
            setProfileData({ ...user, id: userId });
            fetchVehicles(userId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authToken]);

    const fetchVehicles = async (userId) => {
        try {
            const res = await axios.get(`${VEHICLES_API_URL}/user/${userId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setVehicles(res.data);
        } catch (err) {
            console.error("Failed to fetch vehicles", err);
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const userId = profileData.id || localStorage.getItem('userId');

        try {
            const res = await axios.post(`${API_BASE_URL}/${userId}/upload-profile-image`, formData, {
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
        const userId = profileData.id || localStorage.getItem('userId');
        try {
            const res = await axios.put(`${API_BASE_URL}/${userId}/profile`, {
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

    const handleVehicleFormChange = (e) => {
        setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.name === 'vehicleImage') setVImage(e.target.files[0]);
        if (e.target.name === 'licenseImage') setLImage(e.target.files[0]);
    };

    const resetVehicleForm = () => {
        setIsAddingVehicle(false);
        setEditingVehicleId(null);
        setNewVehicle({ vehicleNumber: '', brand: '', model: '', type: storedTypes.length > 0 ? storedTypes[0] : 'Car', fuelType: 'Petrol' });
        setVImage(null);
        setLImage(null);
    };

    const handleAddOrUpdateVehicle = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("vehicleNumber", newVehicle.vehicleNumber);
        formData.append("brand", newVehicle.brand);
        formData.append("model", newVehicle.model);
        formData.append("type", newVehicle.type);
        formData.append("fuelType", newVehicle.fuelType);

        if (vImage) formData.append("vehicleImage", vImage);
        if (lImage) formData.append("licenseImage", lImage);

        try {
            if (editingVehicleId) {
                await axios.put(`${VEHICLES_API_URL}/${editingVehicleId}`, formData, {
                    headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'multipart/form-data' }
                });
                alert("Vehicle updated successfully!");
            } else {
                if (!vImage || !lImage) {
                    alert("Images are required for new vehicles.");
                    return;
                }
                const userId = profileData.id || localStorage.getItem('userId');
                await axios.post(`${VEHICLES_API_URL}/add/${userId}`, formData, {
                    headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'multipart/form-data' }
                });
                alert("Vehicle added successfully!");
            }
            const userId = profileData.id || localStorage.getItem('userId');
            fetchVehicles(userId);
            resetVehicleForm();
        } catch (err) {
            console.error(err);
            alert("Failed to save vehicle details.");
        }
    };

    const handleDeleteVehicle = async (vId) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            await axios.delete(`${VEHICLES_API_URL}/${vId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const userId = profileData.id || localStorage.getItem('userId');
            fetchVehicles(userId);
        } catch (err) {
            console.error(err);
            alert("Failed to delete vehicle.");
        }
    };

    const startEditVehicle = (veh) => {
        setNewVehicle({
            vehicleNumber: veh.vehicleNumber,
            brand: veh.brand,
            model: veh.model,
            type: veh.type || 'Car',
            fuelType: veh.fuelType || 'Petrol'
        });
        setEditingVehicleId(veh.id);
        setIsAddingVehicle(true);
    };

    const profilePicUrl = profileData.profilePicture
        ? `http://localhost:8080/api/users/profile-image/${profileData.profilePicture}`
        : 'https://ui-avatars.com/api/?name=DR';

    return (
        <div className="dr-profile-container">
            <div className="dr-profile-header card-glass">
                <div className="header-left">
                    <div className="avatar-wrapper">
                        <img src={profilePicUrl} alt="Profile" className="dr-avatar-img" />
                        <label className="avatar-upload-label">
                            <input type="file" hidden accept="image/*" onChange={handleProfileImageUpload} />
                            <span className="material-symbols-outlined">add_a_photo</span>
                        </label>
                    </div>
                    <div className="header-info">
                        <h2>{profileData.name}</h2>
                        <p className="role-chip">Driver</p>
                    </div>
                </div>
                <button className="primary-btn" onClick={() => setIsEditMode(!isEditMode)}>
                    <span className="material-symbols-outlined">{isEditMode ? 'close' : 'edit'}</span>
                    {isEditMode ? 'Cancel Edit' : 'Edit Profile'}
                </button>
            </div>

            <div className="dr-content-grid">

                <div className="dr-panel card-glass">
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
                            <label>National ID (NIC) {profileData.nicNumber ? '' : '(If available)'}</label>
                            <input
                                type="text" name="nicNumber"
                                value={profileData.nicNumber || ''}
                                onChange={handleProfileChange}
                                disabled={!isEditMode}
                                placeholder="Enter NIC Number"
                            />
                        </div>

                        {isEditMode && (
                            <button className="save-btn" onClick={saveProfileDetails}>Save Profile Details</button>
                        )}
                    </div>
                </div>

                <div className="dr-panel card-glass vehicles-panel">
                    <div className="panel-header-row">
                        <h3 className="panel-title">My Registered Vehicles</h3>
                        {!isAddingVehicle && (
                            <button className="add-btn" onClick={() => setIsAddingVehicle(true)}>
                                <span className="material-symbols-outlined">add</span> Add New
                            </button>
                        )}
                    </div>

                    <div className="panel-body">
                        {isAddingVehicle && (
                            <form className="add-vehicle-form" onSubmit={handleAddOrUpdateVehicle}>
                                <h4>{editingVehicleId ? "Edit Vehicle Details" : "Register New Vehicle"}</h4>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Vehicle Type</label>
                                        <select name="type" required value={newVehicle.type} onChange={handleVehicleFormChange}>
                                            {storedTypes.map((t, idx) => (
                                                <option key={idx} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Fuel Type</label>
                                        <select name="fuelType" required value={newVehicle.fuelType} onChange={handleVehicleFormChange}>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="EV">Electric (EV)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Brand</label>
                                        <input type="text" name="brand" required value={newVehicle.brand} onChange={handleVehicleFormChange} placeholder="e.g. Toyota" />
                                    </div>
                                    <div className="form-group">
                                        <label>Model</label>
                                        <input type="text" name="model" required value={newVehicle.model} onChange={handleVehicleFormChange} placeholder="e.g. Prius" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>License Plate Number</label>
                                    <input type="text" name="vehicleNumber" required value={newVehicle.vehicleNumber} onChange={handleVehicleFormChange} placeholder="e.g. CAA-1234" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Vehicle Image {!editingVehicleId && '*'}</label>
                                        <input type="file" name="vehicleImage" accept="image/*" onChange={handleFileChange} required={!editingVehicleId} />
                                    </div>
                                    <div className="form-group">
                                        <label>Revenue License {!editingVehicleId && '*'}</label>
                                        <input type="file" name="licenseImage" accept="image/*" onChange={handleFileChange} required={!editingVehicleId} />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={resetVehicleForm}>Cancel</button>
                                    <button type="submit" className="save-btn" style={{ marginTop: 0 }}>{editingVehicleId ? "Update Vehicle" : "Save Vehicle"}</button>
                                </div>
                            </form>
                        )}

                        <div className="data-list">
                            {vehicles.length === 0 && !isAddingVehicle && (
                                <div className="empty-state">
                                    <span className="material-symbols-outlined">directions_car</span>
                                    <p>No vehicles registered yet.</p>
                                </div>
                            )}

                            {vehicles.map(v => (
                                <div className="item-card" key={v.id}>
                                    <div className="item-info">
                                        {v.vehicleImage && (
                                            <img src={`http://localhost:8080/api/vehicles/docs/${v.vehicleImage}`} alt={v.model} className="vehicle-img-thumb" />
                                        )}
                                        <div>
                                            <h4>{v.brand} {v.model}</h4>
                                            <p className="item-details"><span className="material-symbols-outlined">pin</span> {v.vehicleNumber}</p>
                                            <p className="item-details"><span className="material-symbols-outlined">category</span> {v.type} • {v.fuelType}</p>
                                        </div>
                                    </div>
                                    <div className="action-btns">
                                        <button className="edit-btn" onClick={() => startEditVehicle(v)} title="Edit Details">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDeleteVehicle(v.id)} title="Delete Vehicle">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DrProfile;
