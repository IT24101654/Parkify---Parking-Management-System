import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './ParkingManagement.css';
import parkingBg from '../../Assets/parking-bg.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes, faCogs,
    faClock, faMapMarkerAlt, faInfoCircle,
    faCar, faMotorcycle, faTruck, faBolt
} from '@fortawesome/free-solid-svg-icons';
import ManageSlot from './ManageSlot';

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
    dustyRose: '#A88373',
    sageGreen: '#7D846C',
    taupe: '#9C8B7A',
    beigeBg: '#EAE3D8'
};


const ParkingManagement = ({ onManageInventory }) => {
    const [mapCenter, setMapCenter] = useState(defaultMapCenter);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [formData, setFormData] = useState({
        parkingName: '',
        description: '',
        slots: '',
        address: '',
        city: '',
        area: '',
        location: '',
        price: '',
        dailyPrice: '',
        weekendPrice: '',
        type: 'Private',
        openHours: '08:00',
        closeHours: '20:00',
        is24Hours: false,
        weekendAvailable: true,
        temporaryClosed: false,
        status: 'ACTIVE'
    });
    const [parkingPlaces, setParkingPlaces] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Slot Management State
    const [showDetailedModal, setShowDetailedModal] = useState(false);
    const [selectedPlaceForDetails, setSelectedPlaceForDetails] = useState(null);

    const [showSlotManager, setShowSlotManager] = useState(false);
    const [currentPlaceForSlots, setCurrentPlaceForSlots] = useState(null);
    const [errors, setErrors] = useState({});


    useEffect(() => {
        loadParkingPlaces();
    }, []);

    const loadParkingPlaces = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const result = await axios.get(`/api/parking/owner/${userId}`, config);
            setParkingPlaces(result.data);
        } catch (error) {
            console.error("Error loading data", error);
        }
    };

    const onInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData({ ...formData, [name]: val });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const openSlotManager = (place) => {
        setCurrentPlaceForSlots(place);
        setShowSlotManager(true);
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
            newErrors.location = "You MUST click on the map to drop a location pin for drivers to find you.";
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
                ownerId: localStorage.getItem('userId'),
                latitude: selectedLocation?.lat,
                longitude: selectedLocation?.lng
            };

            let savedPlaceId = null;
            if (isEditMode) {
                await axios.put(`/api/parking/update/${editId}`, payload, config);
                savedPlaceId = editId;
            } else {
                const response = await axios.post(`/api/parking/add`, payload, config);
                savedPlaceId = response.data.id;
            }

            // Upload image if provided
            if (imageFile && savedPlaceId) {
                const imgData = new FormData();
                imgData.append("file", imageFile);
                const imgConfig = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } };
                await axios.post(`/api/parking/${savedPlaceId}/upload-image`, imgData, imgConfig);
            }

            alert(`Parking Place ${isEditMode ? 'Updated' : 'Registered'} Successfully!`);

            loadParkingPlaces();
            setShowAddForm(false);
            setFormData({
                parkingName: '', description: '', slots: '', address: '', city: '', area: '', location: '', price: '',
                dailyPrice: '', weekendPrice: '', type: 'Private', openHours: '08:00', closeHours: '20:00',
                is24Hours: false, weekendAvailable: true, temporaryClosed: false, status: 'ACTIVE'
            });
            setErrors({});
            setIsEditMode(false);
            setEditId(null);
            setImageFile(null);
            setSelectedLocation(null);
            setMapCenter(defaultMapCenter);
        } catch (error) {
            console.error("Action error:", error);
            alert("Action failed. Please check your data.");
        }
    };

    const handleEdit = (place) => {
        setFormData({
            parkingName: place.parkingName || '',
            description: place.description || '',
            slots: place.slots || '',
            address: place.address || '',
            city: place.city || '',
            area: place.area || '',
            location: place.location || '',
            price: place.price || '',
            dailyPrice: place.dailyPrice || '',
            weekendPrice: place.weekendPrice || '',
            type: place.type || 'Private',
            openHours: place.openHours || '08:00',
            closeHours: place.closeHours || '20:00',
            is24Hours: place.is24Hours || false,
            weekendAvailable: place.weekendAvailable || true,
            temporaryClosed: place.temporaryClosed || false,
            status: place.status || 'ACTIVE'
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
    const handleToggleFeature = async (placeId, featureType, assigned) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Find current place to get both flags
            const place = parkingPlaces.find(p => p.id === placeId);
            const payload = {
                hasInventory: featureType === 'hasInventory' ? assigned : place.hasInventory,
                hasServiceCenter: featureType === 'hasServiceCenter' ? assigned : place.hasServiceCenter
            };

            await axios.patch(`/api/parking/${placeId}/features`, payload, config);

            // Update local state
            setParkingPlaces(parkingPlaces.map(p =>
                p.id === placeId ? { ...p, [featureType]: assigned } : p
            ));
        } catch (error) {
            console.error("Error toggling feature:", error);
            alert("Failed to update feature assignment.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this place?")) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/api/parking/delete/${id}`, config);
                alert("Parking Place Deleted Successfully!");
                loadParkingPlaces();
            } catch (error) {
                console.error("Deletion error:", error);
                alert("Error deleting record.");
            }
        }
    };

    const handleShowDetails = async (place) => {
        setSelectedPlaceForDetails({ ...place, isLoadingDetails: true });
        setShowDetailedModal(true);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`/api/slots/place/${place.id}`, config);
            const slots = res.data;
            const available = slots.filter(s => s.slotStatus === 'Available').length;
            const types = [...new Set(slots.map(s => s.slotType))];

            setSelectedPlaceForDetails({
                ...place,
                availableSlots: available,
                slotTypes: types,
                isLoadingDetails: false
            });
        } catch (error) {
            console.error("Error fetching slots for details:", error);
            setSelectedPlaceForDetails({ ...place, isLoadingDetails: false });
        }
    };

    return (
        <div className="pm-main-layout">
            <div className="pm-wrapper">

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
                                    <th>INVENTORY</th>
                                    <th>SERVICE</th>
                                    <th>PRICE (RS.)</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parkingPlaces.map((place) => (
                                    <tr key={place.id} onClick={() => handleShowDetails(place)} style={{ cursor: 'pointer' }}>
                                        <td>{place.parkingName}</td>
                                        <td>{place.slots}</td>
                                        <td>{place.location}</td>
                                        <td><span className="pm-badge-type">{place.type}</span></td>
                                        <td className="pm-feature-cell">
                                            <input
                                                type="checkbox"
                                                className="pm-feature-checkbox"
                                                checked={place.hasInventory || false}
                                                onChange={(e) => handleToggleFeature(place.id, 'hasInventory', e.target.checked)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="pm-feature-cell">
                                            <input
                                                type="checkbox"
                                                className="pm-feature-checkbox"
                                                checked={place.hasServiceCenter || false}
                                                onChange={(e) => handleToggleFeature(place.id, 'hasServiceCenter', e.target.checked)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="pm-price-val">Rs. {place.price}</td>
                                        <td>
                                            <button className="pm-action-icon manage" onClick={(e) => { e.stopPropagation(); openSlotManager(place); }} style={{ marginRight: '10px', backgroundColor: '#f39c12', color: 'white' }}>
                                                <i className="fa fa-th"></i>
                                            </button>
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

                {showAddForm && (
                    <div className="pm-form-reveal">
                        <div className="pm-form-card" style={{ maxWidth: '900px' }}>
                            <div className="pm-form-header" style={{ backgroundColor: palette.darkBlue }}>
                                <h2>{isEditMode ? 'UPDATE PARKING PLACE' : 'ADD NEW PARKING PLACE'}</h2>
                                <button className="pm-close-form" onClick={() => setShowAddForm(false)}>×</button>
                            </div>

                            <form className="pm-actual-form" onSubmit={handleRegister} noValidate>
                                <div className="pm-grid-row">
                                    <div className="pm-field">
                                        <label><i className="fa fa-car"></i> Parking Name</label>
                                        <input type="text" name="parkingName" placeholder="Enter name" value={formData.parkingName} onChange={onInputChange} style={{ borderColor: errors.parkingName ? 'red' : '' }} />
                                        {errors.parkingName && <span className="pm-err">{errors.parkingName}</span>}
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-th"></i> Total Slots</label>
                                        <input type="text" name="slots" placeholder="Enter total slots" value={formData.slots} onChange={onInputChange} style={{ borderColor: errors.slots ? 'red' : '' }} />
                                        {errors.slots && <span className="pm-err">{errors.slots}</span>}
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Description (Premium Overview)</label>
                                    <textarea
                                        placeholder="Describe your parking place, amenities, safety features, etc."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="premium-textarea"
                                    ></textarea>
                                </div>

                                <div className="pm-grid-row">
                                    <div className="pm-field">
                                        <label><i className="fa fa-map-marker"></i> Full Address</label>
                                        <input type="text" name="address" placeholder="123 Main St" value={formData.address} onChange={onInputChange} />
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-city"></i> City / Area</label>
                                        <input type="text" name="city" placeholder="City" value={formData.city} onChange={onInputChange} />
                                    </div>
                                </div>

                                <div className="pm-grid-row">
                                    <div className="pm-field">
                                        <label><i className="fa fa-money-bill"></i> Hourly Rate (Rs.)</label>
                                        <input type="text" name="price" placeholder="Hr rate" value={formData.price} onChange={onInputChange} />
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-calendar-day"></i> Daily Rate (Rs.)</label>
                                        <input type="text" name="dailyPrice" placeholder="Daily rate" value={formData.dailyPrice} onChange={onInputChange} />
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-calendar-week"></i> Weekend Rate (Rs.)</label>
                                        <input type="text" name="weekendPrice" placeholder="Weekend rate" value={formData.weekendPrice} onChange={onInputChange} />
                                    </div>
                                </div>

                                <div className="pm-grid-row">
                                    <div className="pm-field">
                                        <label><i className="fa fa-clock"></i> Opening Hour</label>
                                        <input type="time" name="openHours" value={formData.openHours} onChange={onInputChange} />
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-clock"></i> Closing Hour</label>
                                        <input type="time" name="closeHours" value={formData.closeHours} onChange={onInputChange} />
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-list"></i> Category</label>
                                        <select name="type" value={formData.type} onChange={onInputChange}>
                                            <option value="Private">Private</option>
                                            <option value="Public">Public</option>
                                            <option value="VIP">VIP</option>
                                            <option value="Staff">Staff</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pm-grid-row" style={{ marginTop: '10px' }}>
                                    <div className="pm-check-field">
                                        <input type="checkbox" name="is24Hours" checked={formData.is24Hours} onChange={onInputChange} id="check24" />
                                        <label htmlFor="check24">Open 24 Hours</label>
                                    </div>
                                    <div className="pm-check-field">
                                        <input type="checkbox" name="weekendAvailable" checked={formData.weekendAvailable} onChange={onInputChange} id="checkWeekend" />
                                        <label htmlFor="checkWeekend">Weekend Available</label>
                                    </div>
                                    <div className="pm-check-field">
                                        <input type="checkbox" name="temporaryClosed" checked={formData.temporaryClosed} onChange={onInputChange} id="checkClosed" />
                                        <label htmlFor="checkClosed">Temporary Closed</label>
                                    </div>
                                </div>

                                <div className="pm-grid-row" style={{ marginTop: '15px' }}>
                                    <div className="pm-field">
                                        <label><i className="fa fa-map-pin"></i> Display Location Text</label>
                                        <input type="text" name="location" placeholder="e.g. Near City Center" value={formData.location} onChange={onInputChange} />
                                    </div>
                                    <div className="pm-field">
                                        <label><i className="fa fa-image"></i> Place Image</label>
                                        <input type="file" className="pm-file-input-box" onChange={(e) => setImageFile(e.target.files[0])} />
                                    </div>
                                </div>

                                <div className="pm-field" style={{ marginBottom: '25px' }}>
                                    <label><i className="fa fa-map"></i> Pin Exact Location on Map</label>
                                    <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '200px', borderRadius: '10px' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationMarker selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
                                    </MapContainer>
                                </div>

                                <button type="submit" className="pm-submit-btn" style={{ backgroundColor: palette.darkBlue }}>
                                    {isEditMode ? 'UPDATE PARKING PLACE' : 'REGISTER PARKING PLACE'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>            {/* Slot Manager Modal (Extracted) */}
            <ManageSlot
                place={currentPlaceForSlots}
                isOpen={showSlotManager}
                onClose={() => setShowSlotManager(false)}
            />

            {/* Redesigned Detailed Info Modal */}
            {showDetailedModal && selectedPlaceForDetails && (
                <div className="pm-modal-overlay">
                    <div className="pm-modal-content detailed-info-modal animate-fade-in">
                        <button className="premium-close-btn" onClick={() => setShowDetailedModal(false)} aria-label="Close">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>

                        <div className="detailed-modal-body">
                            {/* Modern Hero Section */}
                            <div className="place-preview-hero" style={{ backgroundImage: `url(${selectedPlaceForDetails.placeImage ? `http://localhost:8080/api/parking/image/${selectedPlaceForDetails.placeImage}` : parkingBg})` }}>
                                <div className="hero-overlay">
                                    <div className="hero-badge-row">
                                        <span className={`status-chip ${selectedPlaceForDetails.status.toLowerCase()}`}>{selectedPlaceForDetails.status}</span>
                                        <span className="type-chip">{selectedPlaceForDetails.type}</span>
                                    </div>
                                    <h1>{selectedPlaceForDetails.parkingName}</h1>
                                    <p className="hero-location">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                        {selectedPlaceForDetails.address ? `${selectedPlaceForDetails.address}, ` : ''}
                                        {selectedPlaceForDetails.city || ''}
                                    </p>
                                </div>
                            </div>

                            <div className="detailed-content-grid">
                                {/* Left Section: Overview, Logistics & Timing */}
                                <div className="details-main-column">
                                    <div className="info-card description-card">
                                        <h3><FontAwesomeIcon icon={faInfoCircle} /> About this Parking</h3>
                                        <p className="detailed-desc">{selectedPlaceForDetails.description || "A premium parking facility managed through Parkify."}</p>
                                    </div>

                                    <div className="info-card types-card">
                                        <h3><FontAwesomeIcon icon={faCogs} /> Supported Vehicles</h3>
                                        <div className="slot-types-wrap">
                                            {selectedPlaceForDetails.slotTypes?.length > 0 ? (
                                                selectedPlaceForDetails.slotTypes.map(type => (
                                                    <div key={type} className="v-tag">
                                                        <FontAwesomeIcon icon={
                                                            type.toLowerCase().includes('car') ? faCar :
                                                                type.toLowerCase().includes('bike') ? faMotorcycle :
                                                                    type.toLowerCase().includes('van') ? faTruck :
                                                                        type.toLowerCase().includes('ev') ? faBolt : faCar
                                                        } />
                                                        <span>{type}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="no-types">Configure Slots to see supported types</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="info-card timing-card">
                                        <h3><FontAwesomeIcon icon={faClock} /> Operating Hours</h3>
                                        <div className="timing-details">
                                            <span className="time-range">{selectedPlaceForDetails.is24Hours ? "Open 24/7" : `${selectedPlaceForDetails.openHours} - ${selectedPlaceForDetails.closeHours}`}</span>
                                            {selectedPlaceForDetails.weekendAvailable && <span className="weekend-badge">Weekend Available</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Pricing & Live Status */}
                                <div className="details-side-column">
                                    <div className={`info-card availability-summary ${selectedPlaceForDetails.availableSlots > 0 ? 'available' : 'full'}`}>
                                        <div className="availability-main">
                                            <span className="avail-label">Available Slots</span>
                                            <span className="avail-value">
                                                {selectedPlaceForDetails.isLoadingDetails ? '...' : selectedPlaceForDetails.availableSlots}
                                                <small> / {selectedPlaceForDetails.slots}</small>
                                            </span>
                                        </div>
                                        <div className="availability-progress">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${(selectedPlaceForDetails.availableSlots / selectedPlaceForDetails.slots) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="info-card pricing-card">
                                        <h3>Pricing Plans</h3>
                                        <div className="pricing-grid">
                                            <div className="price-item">
                                                <span className="p-label">Hourly</span>
                                                <span className="p-value"><small>LKR</small> {selectedPlaceForDetails.price}</span>
                                            </div>
                                            <div className="price-item">
                                                <span className="p-label">Daily</span>
                                                <span className="p-value">{selectedPlaceForDetails.dailyPrice ? <><small>LKR</small> {selectedPlaceForDetails.dailyPrice}</> : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-footer-actions">
                                        <button className="manage-cta-btn" onClick={() => { setShowDetailedModal(false); openSlotManager(selectedPlaceForDetails); }}>
                                            <FontAwesomeIcon icon={faCogs} /> Manage Slots
                                        </button>
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