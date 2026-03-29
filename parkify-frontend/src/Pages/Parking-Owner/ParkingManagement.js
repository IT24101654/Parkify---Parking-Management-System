import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ParkingManagement.css';
import parkingBg from '../../Assets/parking-bg.jpg';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const defaultMapCenter = { lat: 6.9271, lng: 79.8612 }; // Colombo default

const LocationMarker = ({ selectedLocation, setSelectedLocation }) => {
    useMapEvents({
        click(e) {
            setSelectedLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return selectedLocation === null ? null : (
        <Marker position={selectedLocation}></Marker>
    );
};

const palette = {
    darkBlue: '#34495E',
    orange: '#D35400'
};

vdshjqdfsdfjhdgjeg

const ParkingManagement = () => {
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [mapCenter, setMapCenter] = useState(defaultMapCenter);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [formData, setFormData] = useState({
        parkingName: '',
        slots: '',
        location: '',
        price: '',
        type: 'Private'
    });
    const [parkingPlaces, setParkingPlaces] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadParkingPlaces();
    }, []);

    const loadParkingPlaces = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const result = await axios.get("http://localhost:8080/api/parking", config);
            setParkingPlaces(result.data);
        } catch (error) {
            console.error("Error loading data", error);
        }
    };

    const onInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'slots') {
            if (value !== '' && !/^\d+$/.test(value)) return;
        }
        if (name === 'price') {
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
        }
        
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        let newErrors = {};
        
        if (!formData.parkingName || formData.parkingName.trim() === '') {
            newErrors.parkingName = "Parking Name is required.";
        } else if (formData.location && formData.location.trim() !== '') {
            const isDuplicate = parkingPlaces.some(p => 
                p.parkingName.toLowerCase() === formData.parkingName.trim().toLowerCase() && 
                p.location.toLowerCase() === formData.location.trim().toLowerCase() && 
                p.id !== editId
            );
            if (isDuplicate) {
                newErrors.parkingName = "A parking place with this name already exists.";
            }
        }

        if (!formData.slots || formData.slots.toString().trim() === '') {
            newErrors.slots = "Total Slots is required.";
        } else if (isNaN(formData.slots) || Number(formData.slots) <= 0) {
            newErrors.slots = "Total Slots must be a valid positive number.";
        }

        if (!formData.location || formData.location.trim() === '') {
            newErrors.location = "Location is required.";
        }

        if (!formData.price || formData.price.toString().trim() === '') {
            newErrors.price = "Price is required.";
        } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
            newErrors.price = "Price must be a valid positive number.";
        }

        if (!selectedLocation) {
            newErrors.map = "Please explicitly pin the exact location on the map.";
            alert("❗ Please pinpoint the exact location on the map before proceeding.");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                ...formData,
                latitude: selectedLocation?.lat,
                longitude: selectedLocation?.lng
            };

            let savedPlaceId = null;
            if (isEditMode) {
                await axios.put(`http://localhost:8080/api/parking/update/${editId}`, payload, config);
                savedPlaceId = editId;
            } else {
                const response = await axios.post("http://localhost:8080/api/parking/add", payload, config);
                savedPlaceId = response.data.id;
            }

            // Upload image if provided
            if (imageFile && savedPlaceId) {
                const imgData = new FormData();
                imgData.append("file", imageFile);
                const imgConfig = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } };
                await axios.post(`http://localhost:8080/api/parking/${savedPlaceId}/upload-image`, imgData, imgConfig);
            }

            alert(`Parking Place ${isEditMode ? 'Updated' : 'Registered'} Successfully!`);

            loadParkingPlaces();
            setShowAddForm(false);
            setFormData({ parkingName: '', slots: '', location: '', price: '', type: 'Private' });
            setErrors({});
            setIsEditMode(false);
            setEditId(null);
            setImageFile(null);
            setSelectedLocation(null);
            setMapCenter(defaultMapCenter);
        } catch (error) {
            console.error("Action error:", error);
            if (error.response && error.response.data && typeof error.response.data === 'string') {
                alert(`Failed to ${isEditMode ? 'update' : 'register'}: ${error.response.data}`);
            } else if (error.response && error.response.data && error.response.data.message) {
                alert(`Failed to ${isEditMode ? 'update' : 'register'}: ${error.response.data.message}`);
            } else {
                alert(`Failed to ${isEditMode ? 'update' : 'register'}. Please check your data and ensure the system is running.`);
            }
        }
    };

    const handleEdit = (place) => {
        setFormData({
            parkingName: place.parkingName,
            slots: place.slots,
            location: place.location,
            price: place.price,
            type: place.type
        });
        if (place.latitude && place.longitude) {
            setSelectedLocation({ lat: place.latitude, lng: place.longitude });
            setMapCenter({ lat: place.latitude, lng: place.longitude });
        } else {
            setSelectedLocation(null);
            setMapCenter(defaultMapCenter);
        }
        setErrors({});
        setIsEditMode(true);
        setEditId(place.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this place?")) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:8080/api/parking/delete/${id}`, config);
                alert("Parking Place Deleted Successfully!");
                loadParkingPlaces();
            } catch (error) {
                console.error("Deletion error:", error);
                alert("Error deleting record.");
            }
        }
    };

    return (
        <div className="pm-main-layout">
            <div className="pm-wrapper">
                <h1 className="pm-page-title">PARKING PLACES MANAGEMENT</h1>

                <div className="pm-table-card" style={{ backgroundImage: `url(${parkingBg})` }}>
                    <div className="pm-overlay"></div>
                    <button
                        className="pm-add-btn"
                        onClick={() => {
                            if (showAddForm) {
                                setShowAddForm(false);
                            } else {
                                setFormData({ parkingName: '', slots: '', location: '', price: '', type: 'Private' });
                                setErrors({});
                                setIsEditMode(false);
                                setEditId(null);
                                setImageFile(null);
                                setSelectedLocation(null);
                                setMapCenter(defaultMapCenter);
                                setShowAddForm(true);
                            }
                        }}
                        style={{ backgroundColor: palette.orange }}
                    >
                        {showAddForm ? '×' : '+'}
                    </button>

                    <div className="pm-table-container">
                        <table className="pm-table">
                            <thead>
                                <tr>
                                    <th>PARKING NAME</th>
                                    <th>SLOTS</th>
                                    <th>LOCATION</th>
                                    <th>TYPE</th>
                                    <th>PRICE (RS.)</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parkingPlaces.map((place) => (
                                    <tr key={place.id} onClick={() => setSelectedPlace(place)} style={{ cursor: 'pointer' }}>
                                        <td>{place.parkingName}</td>
                                        <td>{place.slots}</td>
                                        <td>{place.location}</td>
                                        <td><span className="pm-badge-type">{place.type}</span></td>
                                        <td className="pm-price-val">Rs. {place.price}</td>
                                        <td>
                                            <button className="pm-action-icon edit" onClick={(e) => { e.stopPropagation(); handleEdit(place); }} style={{ marginRight: '10px', backgroundColor: '#3498db', color: 'white' }}>
                                                <i className="fa fa-edit"></i>
                                            </button>
                                            <button className="pm-action-icon delete" onClick={(e) => { e.stopPropagation(); handleDelete(place.id); }}>
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CSS */}
                {showAddForm && (
                    <div className="pm-form-reveal">
                        <div className="pm-form-card">
                            <div className="pm-form-header" style={{ backgroundColor: palette.darkBlue }}>
                                <h2>{isEditMode ? 'UPDATE PARKING PLACE' : 'ADD NEW PARKING PLACE'}</h2>
                                <button className="pm-close-form" onClick={() => setShowAddForm(false)}>×</button>
                            </div>

                            <form className="pm-actual-form" onSubmit={handleRegister} noValidate>
                                <div className="pm-grid-row">
                                    <div className="pm-field">
                                        <label><i className="fa fa-car"></i> Parking Name</label>
                                        <input type="text" name="parkingName" placeholder="Enter name" value={formData.parkingName} onChange={onInputChange} style={{ borderColor: errors.parkingName ? 'red' : '' }} />
                                        {errors.parkingName && <span style={{ color: 'red', fontSize: '13px', marginTop: '5px', display: 'block' }}>{errors.parkingName}</span>}
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-th"></i> Total Slots</label>
                                        <input type="text" name="slots" placeholder="Enter total slots" value={formData.slots} onChange={onInputChange} style={{ borderColor: errors.slots ? 'red' : '' }} />
                                        {errors.slots && <span style={{ color: 'red', fontSize: '13px', marginTop: '5px', display: 'block' }}>{errors.slots}</span>}
                                    </div>
                                </div>

                                <div className="pm-grid-row">
                                    <div className="pm-field">
                                        <label><i className="fa fa-map-marker"></i> Location</label>
                                        <input type="text" name="location" placeholder="Enter location" value={formData.location} onChange={onInputChange} style={{ borderColor: errors.location ? 'red' : '' }} />
                                        {errors.location && <span style={{ color: 'red', fontSize: '13px', marginTop: '5px', display: 'block' }}>{errors.location}</span>}
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-money"></i> Price per Hour (Rs.)</label>
                                        <input type="text" name="price" placeholder="Enter price" value={formData.price} onChange={onInputChange} style={{ borderColor: errors.price ? 'red' : '' }} />
                                        {errors.price && <span style={{ color: 'red', fontSize: '13px', marginTop: '5px', display: 'block' }}>{errors.price}</span>}
                                    </div>
                                </div>

                                <div className="pm-grid-row">
                                    <div className="pm-field">
                                        <label><i className="fa fa-list"></i> Category Type</label>
                                        <select name="type" value={formData.type} onChange={onInputChange}>
                                            <option value="Private">Private</option>
                                            <option value="Public">Public</option>
                                        </select>
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-image"></i> Place Image</label>
                                        <input type="file" className="pm-file-input-box" onChange={(e) => setImageFile(e.target.files[0])} />
                                    </div>
                                </div>

                                <div className="pm-field" style={{ marginBottom: '25px', zIndex: 0 }}>
                                    <label><i className="fa fa-map"></i> Pin Exact Location on Map</label>
                                    <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '250px', borderRadius: '10px', zIndex: 1 }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <LocationMarker selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
                                    </MapContainer>
                                    {selectedLocation && (
                                        <small style={{display: 'block', marginTop: '8px', color: '#7f8c8d', fontWeight: 'bold'}}>
                                            Coordinates Saved: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                                        </small>
                                    )}
                                </div>

                                <button type="submit" className="pm-submit-btn" style={{ backgroundColor: palette.darkBlue }}>
                                    {isEditMode ? 'UPDATE PARKING PLACE' : 'REGISTER PARKING PLACE'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Popup for Details */}
            {selectedPlace && (
                <div className="pm-modal-overlay" onClick={() => setSelectedPlace(null)}>
                    <div className="pm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="pm-modal-close" onClick={() => setSelectedPlace(null)}>
                            <i className="fa fa-times"></i>
                        </button>
                        <div className="pm-modal-header-bg">
                            <img 
                                src={(selectedPlace.placeImage && selectedPlace.placeImage !== 'null' && selectedPlace.placeImage !== '')
                                    ? `http://localhost:8080/api/parking/image/${selectedPlace.placeImage}`
                                    : parkingBg}
                                alt="Parking Background"
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = parkingBg; 
                                }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div className="pm-modal-content">
                            <h2>{selectedPlace.parkingName}</h2>
                            <h4 className="pm-modal-subtitle">{selectedPlace.type} Parking</h4>
                            <div className="pm-modal-details-grid">
                                <div className="pm-detail-box">
                                    <i className="fa fa-map-marker"></i>
                                    <div>
                                        <p className="pm-detail-label">Location</p>
                                        <p className="pm-detail-value">{selectedPlace.location}</p>
                                    </div>
                                </div>
                                <div className="pm-detail-box">
                                    <i className="fa fa-th"></i>
                                    <div>
                                        <p className="pm-detail-label">Total Slots</p>
                                        <p className="pm-detail-value">{selectedPlace.slots}</p>
                                    </div>
                                </div>
                                <div className="pm-detail-box">
                                    <i className="fa fa-money"></i>
                                    <div>
                                        <p className="pm-detail-label">Price</p>
                                        <p className="pm-detail-value">Rs. {selectedPlace.price} / Hr</p>
                                    </div>
                                </div>
                                <div className="pm-detail-box">
                                    <i className="fa fa-info-circle"></i>
                                    <div>
                                        <p className="pm-detail-label">Status</p>
                                        <p className="pm-detail-value" style={{ color: selectedPlace.status === 'AVAILABLE' ? '#2ecc71' : '#e74c3c' }}>
                                            {selectedPlace.status || 'AVAILABLE'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParkingManagement;