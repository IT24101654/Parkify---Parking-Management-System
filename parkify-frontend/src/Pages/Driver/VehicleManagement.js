import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VehicleManagement.css';

function VehicleManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    
    // Dynamic vehicle types based on User's registered selections
    const storedTypes = JSON.parse(localStorage.getItem("selectedVehicles")) || ['Car', 'Bike', 'Van'];

    const [formData, setFormData] = useState({
        vehicleNumber: '',
        brand: '',
        model: '',
        type: storedTypes.length > 0 ? storedTypes[0] : 'Car',
        fuelType: 'Petrol',
    });
    const [vImage, setVImage] = useState(null);
    const [lImage, setLImage] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchVehicles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/vehicles/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching vehicles:", err);
            setError("Failed to load your vehicles. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.name === 'vehicleImage') setVImage(e.target.files[0]);
        if (e.target.name === 'licenseImage') setLImage(e.target.files[0]);
    };

    const resetForm = () => {
        setFormData({
            vehicleNumber: '',
            brand: '',
            model: '',
            type: storedTypes.length > 0 ? storedTypes[0] : 'Car',
            fuelType: 'Petrol',
        });
        setVImage(null);
        setLImage(null);
        setEditingVehicle(null);
        setIsFormVisible(false);
    };

    const handleAddOrUpdateVehicle = async (e) => {
        e.preventDefault();
        
        if (editingVehicle) {
            // Update logic (Backend expects FormData including optional images via PUT)
            const data = new FormData();
            data.append("vehicleNumber", formData.vehicleNumber);
            data.append("brand", formData.brand);
            data.append("model", formData.model);
            data.append("type", formData.type);
            data.append("fuelType", formData.fuelType);
            if (vImage) data.append("vehicleImage", vImage);
            if (lImage) data.append("licenseImage", lImage);

            try {
                const token = localStorage.getItem('token');
                await axios.put(`/api/vehicles/${editingVehicle.id}`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert("Vehicle details updated successfully!");
                fetchVehicles();
                resetForm();
            } catch (err) {
                console.error("Error updating vehicle:", err);
                alert("Failed to update vehicle details.");
            }
        } else {
            // Add logic
            if (!vImage || !lImage) {
                alert("Please upload both Vehicle Image and Revenue License Image.");
                return;
            }

            const data = new FormData();
            data.append("vehicleNumber", formData.vehicleNumber);
            data.append("brand", formData.brand);
            data.append("model", formData.model);
            data.append("type", formData.type);
            data.append("fuelType", formData.fuelType);
            data.append("vehicleImage", vImage);
            data.append("licenseImage", lImage);

            try {
                const token = localStorage.getItem('token');
                await axios.post(`/api/vehicles/add/${userId}`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                alert("Vehicle added successfully!");
                fetchVehicles();
                resetForm();
            } catch (err) {
                console.error("Error adding vehicle:", err);
                alert("Failed to add vehicle. Check details and try again.");
            }
        }
    };

    const handleDeleteVehicle = async (vehicleId) => {
        if (!window.confirm("Are you sure you want to remove this vehicle?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/vehicles/${vehicleId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVehicles();
            alert("Vehicle removed successfully!");
        } catch (err) {
            console.error("Error deleting vehicle:", err);
            alert("Could not delete vehicle.");
        }
    };

    const openEditMode = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            vehicleNumber: vehicle.vehicleNumber,
            brand: vehicle.brand,
            model: vehicle.model,
            type: vehicle.type,
            fuelType: vehicle.fuelType,
        });
        setIsFormVisible(true);
        // smooth scroll to form if needed
        const formEl = document.getElementById("vehicle-form-card");
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const getImageUrl = (fileName) => {
        return `http://localhost:8080/api/vehicles/docs/${fileName}`;
    };

    return (
        <div className="vm-container">
            <div className="vm-header">
                <div>
                    <h2 className="section-title">My Registered Vehicles</h2>
                    <p className="section-subtitle">Manage your fleet for easy reservations</p>
                </div>
                {!isFormVisible && (
                    <button className="vm-btn-primary" onClick={() => setIsFormVisible(true)}>
                        <span className="material-symbols-outlined">add</span>
                        Add New Vehicle
                    </button>
                )}
            </div>

            {error && <p className="vm-error">{error}</p>}

            {isFormVisible && (
                <div id="vehicle-form-card" className="vm-form-card">
                    <div className="vm-form-header">
                        <h3>{editingVehicle ? "Update Vehicle Details" : "Add a Vehicle"}</h3>
                        <button className="vm-btn-close" onClick={resetForm}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <form className="vm-form" onSubmit={handleAddOrUpdateVehicle}>
                        <div className="vm-form-row">
                            <div className="vm-form-group">
                                <label>Vehicle Type</label>
                                <select name="type" value={formData.type} onChange={handleFormChange} required>
                                    {storedTypes.map((t, idx) => (
                                        <option key={idx} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="vm-form-group">
                                <label>Fuel Type</label>
                                <select name="fuelType" value={formData.fuelType} onChange={handleFormChange} required>
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="EV">Electric (EV)</option>
                                </select>
                            </div>
                        </div>

                        <div className="vm-form-row">
                            <div className="vm-form-group">
                                <label>License Plate Number</label>
                                <input type="text" name="vehicleNumber" placeholder="e.g. CAA-1234" value={formData.vehicleNumber} onChange={handleFormChange} required />
                            </div>
                            <div className="vm-form-group">
                                <label>Brand</label>
                                <input type="text" name="brand" placeholder="e.g. Toyota" value={formData.brand} onChange={handleFormChange} required />
                            </div>
                            <div className="vm-form-group">
                                <label>Model</label>
                                <input type="text" name="model" placeholder="e.g. Prius" value={formData.model} onChange={handleFormChange} required />
                            </div>
                        </div>

                        <div className="vm-form-row">
                            <div className="vm-form-group">
                                <label>Vehicle Image {editingVehicle ? '(Optional)' : '(Required)'}</label>
                                <input type="file" name="vehicleImage" accept="image/*" onChange={handleFileChange} required={!editingVehicle} />
                            </div>
                            <div className="vm-form-group">
                                <label>Revenue License Copy {editingVehicle ? '(Optional)' : '(Required)'}</label>
                                <input type="file" name="licenseImage" accept="image/*" onChange={handleFileChange} required={!editingVehicle} />
                            </div>
                        </div>

                        <button type="submit" className="vm-btn-submit">
                            <span className="material-symbols-outlined">{editingVehicle ? 'update' : 'save'}</span>
                            {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
                        </button>
                    </form>
                </div>
            )}

            <div className="vm-list">
                {loading ? (
                    <p>Loading your vehicles...</p>
                ) : vehicles.length === 0 ? (
                    <div className="vm-empty-state">
                        <span className="material-symbols-outlined vm-empty-icon">directions_car</span>
                        <p>No vehicles found. Add your first vehicle to get started!</p>
                    </div>
                ) : (
                    vehicles.map((v) => (
                        <div key={v.id} className="vm-vehicle-card-modern">
                            <div className="vm-vehicle-img-container">
                                <img src={getImageUrl(v.vehicleImage)} alt={v.model} className="vm-vehicle-img-new" />
                                <div className="vm-vehicle-badge-modern">My {v.type}</div>
                            </div>
                            
                            <div className="vm-vehicle-info-modern">
                                <div className="vm-vehicle-title-row">
                                    <h3 className="vm-vehicle-title">{v.brand} {v.model}</h3>
                                </div>
                                
                                <p className="vm-vehicle-subtitle">Registered Fleet Vehicle</p>
                                
                                <div className="vm-vehicle-tags">
                                    <span className="vm-tag vm-tag-primary">
                                        <span className="material-symbols-outlined" style={{fontSize: '14px'}}>ev_station</span>
                                        {v.fuelType}
                                    </span>
                                    <span className="vm-tag">
                                        <span className="material-symbols-outlined" style={{fontSize: '14px'}}>category</span>
                                        {v.type}
                                    </span>
                                </div>

                                <div className="vm-vehicle-bottom">
                                    <div className="vm-plate">
                                        <span className="material-symbols-outlined">pin</span>
                                        {v.vehicleNumber}
                                    </div>
                                    <div className="vm-actions">
                                        <button className="vm-action-btn edit" onClick={() => openEditMode(v)} title="Edit Details">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button className="vm-action-btn delete" onClick={() => handleDeleteVehicle(v.id)} title="Delete Vehicle">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default VehicleManagement;
