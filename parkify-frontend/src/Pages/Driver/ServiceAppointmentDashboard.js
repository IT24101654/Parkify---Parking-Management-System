import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ServiceAppointmentDashboard.css';

const API = 'http://localhost:8080';
const SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

function ServiceAppointmentDashboard({ selectedPlace, userData }) {
    const [activeTab, setActiveTab] = useState('book');

    // ── Service Center info ──────────────────────────────────────
    const [serviceCenter, setServiceCenter] = useState(null);
    const [serviceItems, setServiceItems] = useState([]);

    // ── My Vehicles ─────────────────────────────────────────────
    const [myVehicles, setMyVehicles] = useState([]);

    // ── Booking form ─────────────────────────────────────────────
    const [form, setForm] = useState({
        customerName: '',
        phone: '',
        vehicleId: '',
        vehicleType: 'Car',
        serviceType: 'Full Service',
        serviceCenter: '',
        serviceDate: '',
        timeSlot: '',
        notes: '',
    });
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const [bookingError, setBookingError] = useState(null);

    // ── My Appointments ──────────────────────────────────────────
    const [appointments, setAppointments] = useState([]);
    const [apptLoading, setApptLoading] = useState(false);

    // ── Toast ────────────────────────────────────────────────────
    const [toast, setToast] = useState(null);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const todayStr = new Date().toISOString().split('T')[0];

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Fetch service center + items linked to parking place ─────
    useEffect(() => {
        if (!selectedPlace?.id) return;
        const fetchSC = async () => {
            try {
                // Service center is linked to the parking place owner
                const res = await axios.get(
                    `${API}/api/service-centers/user/${selectedPlace.ownerId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const sc = res.data;
                if (sc && sc.name) {
                    setServiceCenter(sc);
                    setForm(prev => ({ ...prev, serviceCenter: sc.name }));

                    // Fetch items for this service center
                    if (sc.id) {
                        const itemsRes = await axios.get(
                            `${API}/api/service-items/center/${sc.id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setServiceItems(itemsRes.data || []);
                        if (itemsRes.data && itemsRes.data.length > 0) {
                            setForm(prev => ({ ...prev, serviceType: itemsRes.data[0].name }));
                        }
                    }
                } else {
                    // No service center record — fall back to parking place info
                    const fallback = {
                        id: null,
                        name: selectedPlace.parkingName,
                        address: selectedPlace.address || selectedPlace.location || '',
                        contactNumber: null,
                        workingHours: selectedPlace.is24Hours
                            ? 'Open 24/7'
                            : selectedPlace.openHours
                                ? `${selectedPlace.openHours} - ${selectedPlace.closeHours}`
                                : null,
                        active: true,
                    };
                    setServiceCenter(fallback);
                    setServiceItems([]);
                    setForm(prev => ({ ...prev, serviceCenter: fallback.name, serviceType: 'Full Service' }));
                }
            } catch {
                // API error — still fall back to parking place info
                const fallback = {
                    id: null,
                    name: selectedPlace.parkingName,
                    address: selectedPlace.address || selectedPlace.location || '',
                    contactNumber: null,
                    workingHours: selectedPlace.is24Hours
                        ? 'Open 24/7'
                        : selectedPlace.openHours
                            ? `${selectedPlace.openHours} - ${selectedPlace.closeHours}`
                            : null,
                    active: true,
                };
                setServiceCenter(fallback);
                setServiceItems([]);
                setForm(prev => ({ ...prev, serviceCenter: fallback.name, serviceType: 'Full Service' }));
            }
        };
        fetchSC();
    }, [selectedPlace, token]);

    // ── Pre-fill user info + fetch vehicles ─────────────────────
    useEffect(() => {
        if (userData) {
            setForm(prev => ({
                ...prev,
                customerName: userData.name || '',
                phone: userData.phone || '',
            }));
        }
        const fetchVehicles = async () => {
            try {
                const res = await axios.get(`${API}/api/vehicles/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMyVehicles(res.data || []);
                if (res.data && res.data.length > 0) {
                    const v = res.data[0];
                    setForm(prev => ({
                        ...prev,
                        vehicleId: v.vehicleNumber || '',
                        vehicleType: v.type || 'Car',
                    }));
                }
            } catch {
                setMyVehicles([]);
            }
        };
        if (userId) fetchVehicles();
    }, [userData, userId, token]);

    // ── Load time slots when center + date change ────────────────
    useEffect(() => {
        if (!form.serviceCenter || !form.serviceDate) {
            setSlots([]);
            return;
        }
        const loadSlots = async () => {
            setSlotsLoading(true);
            try {
                const res = await axios.get(`${API}/api/service-slots`, {
                    params: { center: form.serviceCenter, date: form.serviceDate },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSlots(res.data?.data || []);
            } catch {
                setSlots(SLOTS.map(s => ({ slot: s, available: true })));
            } finally {
                setSlotsLoading(false);
            }
        };
        loadSlots();
    }, [form.serviceCenter, form.serviceDate, token]);

    // ── Fetch my appointments ────────────────────────────────────
    const fetchAppointments = useCallback(async () => {
        setApptLoading(true);
        try {
            const res = await axios.get(`${API}/api/service-appointments`, {
                params: { driverId: userId, size: 50 },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data?.data?.content || []);
        } catch {
            setAppointments([]);
        } finally {
            setApptLoading(false);
        }
    }, [userId, token]);

    useEffect(() => {
        if (activeTab === 'history') fetchAppointments();
    }, [activeTab, fetchAppointments]);

    // ── Form handlers ─────────────────────────────────────────────
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const updated = { ...prev, [name]: value };
            // Auto-fill vehicle type when vehicle changes
            if (name === 'vehicleId') {
                const v = myVehicles.find(x => x.vehicleNumber === value);
                if (v) updated.vehicleType = v.type || 'Car';
            }
            return updated;
        });
        if (name === 'timeSlot') return; // handled by slot buttons
    };

    const handleSlotSelect = (slot) => {
        setForm(prev => ({ ...prev, timeSlot: slot }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBookingError(null);
        setBookingSuccess(null);

        if (!form.timeSlot) { setBookingError('Please select a time slot.'); return; }
        if (!form.serviceDate) { setBookingError('Please select a service date.'); return; }

        setBookingLoading(true);
        try {
            const payload = {
                customerName: form.customerName,
                phone: form.phone || null,
                vehicleId: form.vehicleId,
                vehicleType: form.vehicleType,
                serviceType: form.serviceType,
                serviceCenter: form.serviceCenter,
                parkingPlaceId: selectedPlace?.id || null,
                driverId: userId ? Number(userId) : null,
                serviceDate: form.serviceDate,
                timeSlot: form.timeSlot,
                notes: form.notes || null,
            };
            const res = await axios.post(`${API}/api/service-appointments`, payload, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const bookingId = res.data?.data?.bookingId;
            setBookingSuccess(`Booking confirmed! Your Booking ID: ${bookingId}`);
            setForm(prev => ({ ...prev, serviceDate: '', timeSlot: '', notes: '' }));
            setSlots([]);
            showToast(`🎉 Appointment booked! ID: ${bookingId}`, 'success');
        } catch (err) {
            const msg = err.response?.data?.message || 'Booking failed. Please try again.';
            setBookingError(msg);
            showToast(msg, 'error');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm(`Cancel appointment ${bookingId}?`)) return;
        try {
            await axios.patch(`${API}/api/service-appointments/${bookingId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast(`Appointment ${bookingId} cancelled.`, 'warning');
            fetchAppointments();
        } catch (err) {
            showToast(err.response?.data?.message || 'Cancel failed.', 'error');
        }
    };

    // ── Status badge ─────────────────────────────────────────────
    const StatusBadge = ({ status }) => {
        const map = {
            BOOKED: { cls: 'badge-booked', label: '🕐 Booked' },
            COMPLETED: { cls: 'badge-completed', label: '✅ Completed' },
            CANCELLED: { cls: 'badge-cancelled', label: '❌ Cancelled' },
        };
        const b = map[status] || { cls: 'badge-default', label: status };
        return <span className={`sa-badge ${b.cls}`}>{b.label}</span>;
    };

    if (!selectedPlace) {
        return (
            <div className="sa-empty-state">
                <span className="material-symbols-outlined sa-empty-icon">build</span>
                <p>Select a parking place from the map to view vehicle services.</p>
            </div>
        );
    }

    if (!serviceCenter) {
        return (
            <div className="sa-loading">
                <span className="material-symbols-outlined sa-spin">refresh</span>
                Loading service center info…
            </div>
        );
    }

    return (
        <div className="sa-dashboard">
            {/* Toast */}
            {toast && (
                <div className={`sa-toast sa-toast-${toast.type}`}>{toast.msg}</div>
            )}

            {/* Service Center Info Banner */}
            <div className="sa-sc-banner">
                <div className="sa-sc-banner-icon">
                    <span className="material-symbols-outlined">build_circle</span>
                </div>
                <div className="sa-sc-banner-info">
                    <h3>{serviceCenter.name}</h3>
                    <p>{serviceCenter.address || selectedPlace.address || 'Vehicle Service Center'}</p>
                    {serviceCenter.workingHours && (
                        <span className="sa-sc-hours">
                            <span className="material-symbols-outlined">schedule</span>
                            {serviceCenter.workingHours}
                        </span>
                    )}
                </div>
                {serviceCenter.contactNumber && (
                    <div className="sa-sc-contact">
                        <span className="material-symbols-outlined">call</span>
                        {serviceCenter.contactNumber}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="sa-tabs">
                <button
                    className={`sa-tab ${activeTab === 'book' ? 'active' : ''}`}
                    onClick={() => setActiveTab('book')}
                >
                    <span className="material-symbols-outlined">calendar_add_on</span>
                    Book Service
                </button>
                <button
                    className={`sa-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <span className="material-symbols-outlined">history</span>
                    My Appointments
                </button>
            </div>

            {/* ── TAB: BOOK SERVICE ─────────────────────────────── */}
            {activeTab === 'book' && (
                <div className="sa-book-panel">
                    {bookingSuccess && (
                        <div className="sa-alert sa-alert-success">
                            <span className="material-symbols-outlined">check_circle</span>
                            {bookingSuccess}
                        </div>
                    )}
                    {bookingError && (
                        <div className="sa-alert sa-alert-error">
                            <span className="material-symbols-outlined">error</span>
                            {bookingError}
                        </div>
                    )}

                    <form className="sa-form" onSubmit={handleSubmit}>
                        {/* Row 1: Name + Phone */}
                        <div className="sa-form-row">
                            <div className="sa-form-group">
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={form.customerName}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="sa-form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleFormChange}
                                    placeholder="07XXXXXXXX"
                                />
                            </div>
                        </div>

                        {/* Row 2: Vehicle + Service Type */}
                        <div className="sa-form-row">
                            <div className="sa-form-group">
                                <label>Select Vehicle</label>
                                {myVehicles.length > 0 ? (
                                    <select
                                        name="vehicleId"
                                        value={form.vehicleId}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        {myVehicles.map(v => (
                                            <option key={v.id} value={v.vehicleNumber}>
                                                {v.brand} {v.model} — {v.vehicleNumber}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        name="vehicleId"
                                        value={form.vehicleId}
                                        onChange={handleFormChange}
                                        required
                                        placeholder="License plate (e.g. CAA-1234)"
                                    />
                                )}
                            </div>
                            <div className="sa-form-group">
                                <label>Vehicle Type</label>
                                <select name="vehicleType" value={form.vehicleType} onChange={handleFormChange} required>
                                    <option value="Car">Car</option>
                                    <option value="Van">Van</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Service Type + Service Center */}
                        <div className="sa-form-row">
                            <div className="sa-form-group">
                                <label>Service Type</label>
                                {serviceItems.length > 0 ? (
                                    <select name="serviceType" value={form.serviceType} onChange={handleFormChange} required>
                                        {serviceItems.map(item => (
                                            <option key={item.id} value={item.name}>{item.name}</option>
                                        ))}
                                        <option value="Other">Other</option>
                                    </select>
                                ) : (
                                    <select name="serviceType" value={form.serviceType} onChange={handleFormChange} required>
                                        <option value="Full Service">Full Service</option>
                                        <option value="Oil Change">Oil Change</option>
                                        <option value="Tire">Tire Service</option>
                                        <option value="Battery">Battery</option>
                                        <option value="Other">Other</option>
                                    </select>
                                )}
                            </div>
                            <div className="sa-form-group">
                                <label>Service Center</label>
                                <input
                                    type="text"
                                    name="serviceCenter"
                                    value={form.serviceCenter}
                                    readOnly
                                    className="sa-readonly-input"
                                />
                            </div>
                        </div>

                        {/* Row 4: Date */}
                        <div className="sa-form-row">
                            <div className="sa-form-group">
                                <label>Service Date</label>
                                <input
                                    type="date"
                                    name="serviceDate"
                                    value={form.serviceDate}
                                    onChange={handleFormChange}
                                    min={todayStr}
                                    required
                                />
                            </div>
                        </div>

                        {/* Time Slots */}
                        <div className="sa-form-group sa-slot-section">
                            <label>Available Time Slots</label>
                            {!form.serviceDate ? (
                                <p className="sa-slot-hint">Select a date to see available slots</p>
                            ) : slotsLoading ? (
                                <p className="sa-slot-hint">⏳ Loading slots…</p>
                            ) : (
                                <div className="sa-slot-grid">
                                    {(slots.length > 0 ? slots : SLOTS.map(s => ({ slot: s, available: true }))).map(s => (
                                        <button
                                            key={s.slot}
                                            type="button"
                                            className={`sa-slot-btn ${form.timeSlot === s.slot ? 'selected' : ''} ${!s.available ? 'booked' : ''}`}
                                            disabled={!s.available}
                                            onClick={() => s.available && handleSlotSelect(s.slot)}
                                        >
                                            {s.slot}
                                            {!s.available && <span className="sa-lock">🔒</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="sa-form-group">
                            <label>Notes <span className="sa-optional">(Optional)</span></label>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleFormChange}
                                rows={3}
                                placeholder="Any special requests or notes for the service center…"
                            />
                        </div>

                        <button type="submit" className="sa-submit-btn" disabled={bookingLoading}>
                            <span className="material-symbols-outlined">
                                {bookingLoading ? 'hourglass_top' : 'calendar_add_on'}
                            </span>
                            {bookingLoading ? 'Booking…' : 'Book Appointment'}
                        </button>
                    </form>
                </div>
            )}

            {/* ── TAB: MY APPOINTMENTS ─────────────────────────── */}
            {activeTab === 'history' && (
                <div className="sa-history-panel">
                    {apptLoading ? (
                        <div className="sa-loading">
                            <span className="material-symbols-outlined sa-spin">refresh</span>
                            Loading appointments…
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="sa-empty-state">
                            <span className="material-symbols-outlined sa-empty-icon">event_busy</span>
                            <p>No appointments yet. Book your first service!</p>
                        </div>
                    ) : (
                        <div className="sa-appt-list">
                            {appointments.map(a => (
                                <div key={a.bookingId} className={`sa-appt-card sa-appt-${a.status.toLowerCase()}`}>
                                    <div className="sa-appt-top">
                                        <div className="sa-appt-id">#{a.bookingId}</div>
                                        <StatusBadge status={a.status} />
                                    </div>
                                    <div className="sa-appt-body">
                                        <div className="sa-appt-row">
                                            <span className="material-symbols-outlined">build</span>
                                            <span>{a.serviceType}</span>
                                        </div>
                                        <div className="sa-appt-row">
                                            <span className="material-symbols-outlined">location_on</span>
                                            <span>{a.serviceCenter}</span>
                                        </div>
                                        <div className="sa-appt-row">
                                            <span className="material-symbols-outlined">directions_car</span>
                                            <span>{a.vehicleId} ({a.vehicleType})</span>
                                        </div>
                                        <div className="sa-appt-row">
                                            <span className="material-symbols-outlined">calendar_today</span>
                                            <span>{a.serviceDate} at {a.timeSlot}</span>
                                        </div>
                                        {a.notes && (
                                            <div className="sa-appt-row sa-appt-notes">
                                                <span className="material-symbols-outlined">notes</span>
                                                <span>{a.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                    {a.status === 'BOOKED' && (
                                        <div className="sa-appt-actions">
                                            <button
                                                className="sa-cancel-btn"
                                                onClick={() => handleCancel(a.bookingId)}
                                            >
                                                <span className="material-symbols-outlined">cancel</span>
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ServiceAppointmentDashboard;
