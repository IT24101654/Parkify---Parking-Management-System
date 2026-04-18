import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './ServiceCenterDashboard.css';
import ManageServiceItems from './ManageServiceItems';
import ManageAppointments from './ManageAppointments';

const ServiceCenterDashboard = ({ userId, activeTab }) => {
    const [serviceCenter, setServiceCenter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditingContact, setIsEditingContact] = useState(false);
    const [editContact, setEditContact] = useState('');
    const [editHours, setEditHours] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [parkingPlaces, setParkingPlaces] = useState([]);
    const [viewAppointments, setViewAppointments] = useState(false);

    const categories = [
        { id: 'wash', name: 'Car Wash', icon: 'local_car_wash', desc: 'Manage car washing and detailing services' },
        { id: 'oil', name: 'Oil Change', icon: 'oil_barrel', desc: 'Manage oil and filter change services' },
        { id: 'tire', name: 'Tire Service', icon: 'tire_repair', desc: 'Manage tire repair and replacement services' },
        { id: 'battery', name: 'Battery Service', icon: 'battery_charging_full', desc: 'Manage battery testing and replacement' },
        { id: 'full', name: 'Full Service', icon: 'engineering', desc: 'Manage comprehensive vehicle maintenance' },
        { id: 'other', name: 'Other Repairs', icon: 'handyman', desc: 'Manage general repairs and utilities' }
    ];

    const fetchServiceCenter = useCallback(async () => {
        if (!userId || serviceCenter) return;
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/service-centers/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServiceCenter(response.data);
            setEditContact(response.data.contactNumber);
            setEditHours(response.data.workingHours);
        } catch (error) {
            console.error('Error fetching service center:', error);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Fetch parking places to find which ones are linked to Service Center
    useEffect(() => {
        const fetchParkingPlaces = async () => {
            try {
                const token = localStorage.getItem('token');
                const ownerId = localStorage.getItem('userId');
                if (!token || !ownerId) return;
                const res = await axios.get(`/api/parking/owner/${ownerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setParkingPlaces(res.data);
            } catch (err) {
                console.error('Failed to fetch parking places for service center:', err);
            }
        };
        fetchParkingPlaces();
    }, []);

    const linkedAddress = useMemo(() => {
        const linkedPlaces = parkingPlaces.filter(p => p.hasServiceCenter);
        if (linkedPlaces.length === 0) return 'Not linked to any parking place';
        const locations = [...new Set(linkedPlaces.map(p => p.location || p.address))].filter(Boolean);
        return locations.length > 0 ? locations.join(', ') : 'Not linked to any parking place';
    }, [parkingPlaces]);

    useEffect(() => {
        if (userId) fetchServiceCenter();
    }, [fetchServiceCenter, userId]);

    const handleUpdateInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/service-centers/${serviceCenter.id}`, {
                ...serviceCenter,
                contactNumber: editContact,
                workingHours: editHours
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServiceCenter({ ...serviceCenter, contactNumber: editContact, workingHours: editHours });
            setIsEditingContact(false);
        } catch (error) {
            alert('Failed to update information.');
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading Service Center...</p></div>;
    if (!serviceCenter) return null;

    if (selectedCategory) {
        return (
            <div className="inventory-wrapper">
                <button className="back-to-sections-btn" onClick={() => setSelectedCategory(null)}>
                    ← Back to Categories
                </button>
                <ManageServiceItems
                    selectedCategory={selectedCategory}
                    serviceCenterId={serviceCenter.id}
                />
            </div>
        );
    }

    if (viewAppointments) {
        return (
            <ManageAppointments 
                serviceCenterName={serviceCenter.name} 
                onBack={() => setViewAppointments(false)} 
            />
        );
    }

    return (
        <div className="inventory-main">
            {/* SERVICE CENTER INFORMATION - Styled to match Inventory aesthetic */}
            <div className="sc-info-card-standalone">
                <div className="inventory-header" style={{ borderBottom: 'none', marginBottom: '20px' }}>
                    <div className="header-text">
                        <h3>Center Details</h3>
                    </div>
                    <button className="add-item-btn" onClick={() => setIsEditingContact(!isEditingContact)}>
                        <span className="material-symbols-outlined">{isEditingContact ? 'close' : 'edit'}</span>
                        {isEditingContact ? 'Cancel' : 'Edit Details'}
                    </button>
                </div>

                <div className="info-grid-modern">
                    <div className="info-box">
                        <label>Center Name</label>
                        <div className="info-val">{serviceCenter.name}</div>
                    </div>
                    <div className="info-box">
                        <label>Contact</label>
                        {isEditingContact ? (
                            <input className="info-edit-input" type="text" value={editContact} onChange={(e) => setEditContact(e.target.value)} />
                        ) : (
                            <div className="info-val">{serviceCenter.contactNumber}</div>
                        )}
                    </div>
                    <div className="info-box">
                        <label>Working Hours</label>
                        {isEditingContact ? (
                            <input className="info-edit-input" type="text" value={editHours} onChange={(e) => setEditHours(e.target.value)} />
                        ) : (
                            <div className="info-val">{serviceCenter.workingHours}</div>
                        )}
                    </div>
                    <div className="info-box">
                        <label>Location / Address</label>
                        <div className="info-val info-val--muted">{linkedAddress}</div>
                    </div>
                </div>

                {isEditingContact && (
                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button className="btn-submit" onClick={handleUpdateInfo}>Save Changes</button>
                    </div>
                )}
            </div>

            {/* APPOINTMENTS STRIP */}
            <div 
                className="manage-appts-strip" 
                onClick={() => setViewAppointments(true)}
            >
                <div className="appt-strip-content">
                    <span className="material-symbols-outlined">event_available</span>
                    <h3>Manage Appointments</h3>
                </div>
                <div className="card-arrow">→</div>
            </div>

            <div className="sc-card-grid">

                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        className="sc-inv-card"
                        onClick={() => setSelectedCategory(cat.name)}
                    >
                        <span className="material-symbols-outlined">{cat.icon}</span>
                        <h3>{cat.name}</h3>
                        <p>{cat.desc}</p>
                        <div className="card-arrow">→</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceCenterDashboard;
