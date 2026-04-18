import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ServiceCenterDashboard.css'; // Reuse styles

const ManageAppointments = ({ serviceCenterName, onBack }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/service-appointments`, {
                params: { serviceCenter: serviceCenterName, size: 100 },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data?.data?.content || []);
        } catch (err) {
            console.error('Failed to load appointments', err);
        } finally {
            setLoading(false);
        }
    }, [serviceCenterName]);

    useEffect(() => {
        if (serviceCenterName) fetchAppointments();
    }, [serviceCenterName, fetchAppointments]);

    const handleAction = async (bookingId, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8080/api/service-appointments/${bookingId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAppointments();
        } catch (err) {
            alert(`Failed to ${action} appointment`);
        }
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading Appointments...</p></div>;

    return (
        <div className="inventory-wrapper">
             <button className="back-to-sections-btn" onClick={onBack}>
                ← Back to Dashboard
            </button>
            <div className="inventory-header">
                <div className="header-text">
                    <h3>Service Appointments</h3>
                    <p>Bookings for {serviceCenterName}</p>
                </div>
            </div>

            <div className="items-list">
                {appointments.length === 0 ? (
                    <div className="empty-state">
                        <span className="material-symbols-outlined icon">event_busy</span>
                        <p>No appointments found.</p>
                    </div>
                ) : (
                    appointments.map(appt => {
                        const isBooked = appt.status === 'BOOKED';
                        const isCompleted = appt.status === 'COMPLETED';
                        const statusColor = isBooked ? '#f59e0b' : isCompleted ? '#10b981' : '#ef4444';
                        const statusIcon = isBooked ? 'pending_actions' : isCompleted ? 'check_circle' : 'cancel';
                        const statusBg = isBooked ? '#fef3c7' : isCompleted ? '#d1fae5' : '#fee2e2';

                        return (
                            <div key={appt.id} className="appt-card-premium">
                                <div className="appt-status-ribbon" style={{ backgroundColor: statusColor }}></div>
                                
                                <div className="appt-header">
                                    <div className="appt-customer">
                                        <div className="appt-avatar">
                                            <span className="material-symbols-outlined">person</span>
                                        </div>
                                        <div>
                                            <h4>{appt.customerName}</h4>
                                            <div className="appt-vehicle-badge">
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                                    {appt.vehicleType?.toLowerCase() === 'bike' || appt.vehicleType?.toLowerCase() === 'motorcycle' ? 'two_wheeler' : 'directions_car'}
                                                </span>
                                                {appt.vehicleId} ({appt.vehicleType})
                                            </div>
                                        </div>
                                    </div>
                                    <div className="appt-status-badge" style={{ backgroundColor: statusBg, color: statusColor }}>
                                        <span className="material-symbols-outlined">{statusIcon}</span>
                                        {appt.status}
                                    </div>
                                </div>

                                <div className="appt-details-grid">
                                    <div className="appt-detail-box">
                                        <span className="material-symbols-outlined icon-muted">build</span>
                                        <div>
                                            <label>Service</label>
                                            <p>{appt.serviceType}</p>
                                        </div>
                                    </div>
                                    <div className="appt-detail-box">
                                        <span className="material-symbols-outlined icon-muted">event</span>
                                        <div>
                                            <label>Schedule</label>
                                            <p>{appt.serviceDate} • {appt.timeSlot}</p>
                                        </div>
                                    </div>
                                    <div className="appt-detail-box">
                                        <span className="material-symbols-outlined icon-muted">call</span>
                                        <div>
                                            <label>Contact</label>
                                            <p>{appt.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="appt-detail-box">
                                        <span className="material-symbols-outlined icon-muted">tag</span>
                                        <div>
                                            <label>Booking ID</label>
                                            <p>{appt.bookingId}</p>
                                        </div>
                                    </div>
                                </div>

                                {appt.notes && (
                                    <div className="appt-notes">
                                        <span className="material-symbols-outlined">sticky_note_2</span>
                                        <p>{appt.notes}</p>
                                    </div>
                                )}

                                {isBooked && (
                                    <div className="appt-actions-bar">
                                        <button className="appt-btn-cancel" onClick={() => handleAction(appt.bookingId, 'cancel')}>
                                            <span className="material-symbols-outlined">close</span>
                                            Cancel
                                        </button>
                                        <button className="appt-btn-complete" onClick={() => handleAction(appt.bookingId, 'complete')}>
                                            <span className="material-symbols-outlined">check_circle</span>
                                            Complete Service
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ManageAppointments;
