import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './POReservationOverview.css';

const POReservationOverview = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [viewModal, setViewModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0
    });

    const fetchReservations = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('userId');
            const res = await axios.get(`http://localhost:8080/api/reservations/owner/${ownerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data || [];
            setReservations(data);
            
            // Calculate stats
            setStats({
                total: data.length,
                pending: data.filter(r => r.status === 'PENDING').length,
                confirmed: data.filter(r => r.status === 'CONFIRMED').length,
                cancelled: data.filter(r => r.status === 'CANCELLED').length
            });
        } catch (err) {
            console.error('Failed to load reservations', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8080/api/reservations/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReservations();
            if (viewModal) setViewModal(false);
        } catch (err) {
            alert(`Failed to ${action} reservation`);
        }
    };

    const openViewModal = (res) => {
        setSelectedReservation(res);
        setViewModal(true);
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading Reservations...</p></div>;

    return (
        <div className="po-res-container">
            {/* Summary Cards */}
            <div className="po-res-stats-grid">
                <div className="po-res-stat-card">
                    <div className="stat-icon-wrap" style={{ background: '#f0f3f5', color: '#7c8671' }}>
                        <span className="material-symbols-outlined">book_online</span>
                    </div>
                    <div className="stat-content">
                        <h3>Total Reservations</h3>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                </div>
                <div className="po-res-stat-card">
                    <div className="stat-icon-wrap" style={{ background: '#fef3c7', color: '#b78b1e' }}>
                        <span className="material-symbols-outlined">pending_actions</span>
                    </div>
                    <div className="stat-content">
                        <h3>Pending</h3>
                        <p className="stat-value">{stats.pending}</p>
                    </div>
                </div>
                <div className="po-res-stat-card">
                    <div className="stat-icon-wrap" style={{ background: '#d1fae5', color: '#7c8671' }}>
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div className="stat-content">
                        <h3>Confirmed</h3>
                        <p className="stat-value">{stats.confirmed}</p>
                    </div>
                </div>
                <div className="po-res-stat-card">
                    <div className="stat-icon-wrap" style={{ background: '#fee2e2', color: '#957164' }}>
                        <span className="material-symbols-outlined">cancel</span>
                    </div>
                    <div className="stat-content">
                        <h3>Cancelled</h3>
                        <p className="stat-value">{stats.cancelled}</p>
                    </div>
                </div>
            </div>

            {/* Reservation Table */}
            <div className="po-res-table-wrapper">
                <div className="inventory-header">
                    <div className="header-text">
                        <h3>Reservation List</h3>
                        <p>Track all driver bookings for your parking locations</p>
                    </div>
                </div>

                <div className="table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Res ID</th>
                                <th>Driver</th>
                                <th>Parking Location</th>
                                <th style={{ textAlign: 'center' }}>Slot</th>
                                <th>Vehicle No</th>
                                <th>Schedule</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="empty-state">
                                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ccc' }}>event_busy</span>
                                            <p>No reservations found yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reservations.map(res => (
                                    <tr key={res.id}>
                                        <td><strong>#{res.id}</strong></td>
                                        <td>{res.driverName}</td>
                                        <td>
                                            <div className="res-parking-info">
                                                <span className="parking-name">{res.parkingName}</span>
                                                <span className="parking-loc">{res.parkingLocation}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}><span className="slot-badge">{res.slotNumber || 'N/A'}</span></td>
                                        <td>{res.vehicleNumber}</td>
                                        <td>
                                            <div className="res-time-info">
                                                <span>{res.reservationDate}</span>
                                                <span className="time-range">{res.startTime} - {res.endTime}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill pill-${res.status?.toLowerCase()}`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`payment-pill pill-${res.paymentStatus?.toLowerCase()}`}>
                                                {res.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                                <button className="btn-view" onClick={() => openViewModal(res)} title="View Details">
                                                    <span className="material-symbols-outlined">visibility</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {viewModal && selectedReservation && (
                <div className="form-modal" onClick={(e) => e.target === e.currentTarget && setViewModal(false)}>
                    <div className="form-modal-content po-res-modal">
                        <div className="sc-modal-stripe" style={{ background: '#f5f2ee', borderBottom: '2px solid #ddd6cc' }}>
                            <div className="sc-modal-badge">
                                <span className="material-symbols-outlined sc-modal-cat-icon icon-center" style={{ color: '#7c8671' }}>
                                    book_online
                                </span>
                                <div>
                                    <div className="sc-modal-cat-label">Reservation Details</div>
                                    <div className="sc-modal-cat-name" style={{ color: '#7c8671' }}>
                                        #{selectedReservation.id}
                                    </div>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setViewModal(false)}>&times;</button>
                        </div>

                        <div className="po-res-detail-grid">
                            <div className="detail-item">
                                <label>Driver Name</label>
                                <p>{selectedReservation.driverName}</p>
                            </div>
                            <div className="detail-item">
                                <label>Parking Place</label>
                                <p>{selectedReservation.parkingName}</p>
                            </div>
                            <div className="detail-item">
                                <label>Slot Number</label>
                                <p><span className="slot-badge">{selectedReservation.slotNumber}</span></p>
                            </div>
                            <div className="detail-item">
                                <label>Vehicle Number</label>
                                <p>{selectedReservation.vehicleNumber} ({selectedReservation.vehicleType})</p>
                            </div>
                            <div className="detail-item">
                                <label>Date</label>
                                <p>{selectedReservation.reservationDate}</p>
                            </div>
                            <div className="detail-item">
                                <label>Time Range</label>
                                <p>{selectedReservation.startTime} - {selectedReservation.endTime}</p>
                            </div>
                            <div className="detail-item">
                                <label>Status</label>
                                <p><span className={`status-pill pill-${selectedReservation.status?.toLowerCase()}`}>{selectedReservation.status}</span></p>
                            </div>
                            <div className="detail-item">
                                <label>Payment Status</label>
                                <p><span className={`payment-pill pill-${selectedReservation.paymentStatus?.toLowerCase()}`}>{selectedReservation.paymentStatus}</span></p>
                            </div>
                            <div className="detail-item full-width">
                                <label>Total Amount</label>
                                <p className="res-amount">Rs. {selectedReservation.totalAmount?.toFixed(2)}</p>
                            </div>
                        </div>


                    </div>
                </div>
            )}
        </div>
    );
};

export default POReservationOverview;
