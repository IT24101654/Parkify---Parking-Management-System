import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../../Components/ServiceCenter/ServiceCenterDashboard.css'; // shared base classes
import './ReservationManagement.css';

// ─────────────────────────────────────────────────────────
//  Accessible Beige color palette
// ─────────────────────────────────────────────────────────
const P = {
    primary:    '#A17060',
    primaryBg:  '#f5f0eb',
    primaryBdr: '#ddd0c8',
    slate:      '#536872',
    slateBg:    '#ecf0f2',
    slateBdr:   '#c0cdd3',
    green:      '#5C6B51',
    greenBg:    '#eef1eb',
    greenBdr:   '#c8d0c0',
    taupe:      '#968478',
    taupeBg:    '#f4f2f0',
    taupeBdr:   '#dcd5cf',
    beige:      '#C5B49A',
};

const STATUS_CFG = {
    PENDING:   { color: P.primary, bg: P.primaryBg, bdr: P.primaryBdr, icon: 'schedule'     },
    CONFIRMED: { color: P.green,   bg: P.greenBg,   bdr: P.greenBdr,   icon: 'check_circle' },
    CANCELLED: { color: '#c0392b', bg: '#fdf2f2',   bdr: '#f5c6c6',    icon: 'cancel'       },
    EXPIRED:   { color: P.taupe,   bg: P.taupeBg,   bdr: P.taupeBdr,   icon: 'timer_off'    },
    COMPLETED: { color: P.slate,   bg: P.slateBg,   bdr: P.slateBdr,   icon: 'task_alt'     },
};
const PAY_CFG = {
    PENDING: { color: P.primary, bg: P.primaryBg, bdr: P.primaryBdr },
    PAID:    { color: P.green,   bg: P.greenBg,   bdr: P.greenBdr   },
};

// Slot status colors
const SLOT_STATUS_COLOR = {
    Available:           { bg: '#eef1eb', border: '#5C6B51', text: '#5C6B51', dot: '#5C6B51' },
    Unavailable:         { bg: '#fdf2f2', border: '#c0392b', text: '#c0392b', dot: '#c0392b' },
    'Under Maintenance': { bg: '#f4f2f0', border: '#968478', text: '#968478', dot: '#968478' },
};

const EMPTY_FORM = {
    driverName: '', driverId: '',
    parkingPlaceId: '', parkingPlaceName: '', parkingLocation: '',
    slotId: '', slotNumber: '',
    vehicleId: '', vehicleNumber: '', vehicleType: 'Car',
    reservationDate: '',
    startTime: '', endTime: '',
    duration: '', totalAmount: '', pricePerHour: '',
};

function calcDuration(start, end) {
    try {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        let mins = (eh * 60 + em) - (sh * 60 + sm);
        if (mins < 0) mins += 24 * 60;
        return Math.round((mins / 60) * 100) / 100;
    } catch { return ''; }
}

// ─────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CFG[status] || STATUS_CFG.PENDING;
    return (
        <span className="resv-status-badge"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.bdr}` }}>
            <span className="material-symbols-outlined resv-badge-icon">{cfg.icon}</span>
            {status}
        </span>
    );
};

const PayBadge = ({ status }) => {
    const cfg = PAY_CFG[status] || PAY_CFG.PENDING;
    return (
        <span className="resv-pay-badge"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.bdr}` }}>
            {status}
        </span>
    );
};

// ─────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────
const ReservationManagement = ({ userData, prefillData, autoOpenForm, onFormOpenHandled, onNavigateToPayment }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [successMsg, setSuccessMsg]     = useState('');
    const [showForm, setShowForm]         = useState(false);
    const [editingId, setEditingId]       = useState(null);
    const [saving, setSaving]             = useState(false);
    const [viewItem, setViewItem]         = useState(null);
    const [formErrors, setFormErrors]     = useState({});
    const [form, setForm]                 = useState(EMPTY_FORM);

    // ── Driver's vehicles & parking slots ──
    const [myVehicles, setMyVehicles]   = useState([]);
    const [parkingSlots, setParkingSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
    });

    const showError   = msg => { setError(msg);      setTimeout(() => setError(''),      5000); };
    const showSuccess = msg => { setSuccessMsg(msg);  setTimeout(() => setSuccessMsg(''), 3500); };

    // Build a fresh form, optionally pre-filled from a parking place click
    const buildForm = useCallback((prefill = null) => {
        const userId = localStorage.getItem('userId') || '';
        return {
            ...EMPTY_FORM,
            driverName:       userData?.name  || '',
            driverId:         userData?.id    || userId,
            parkingPlaceId:   prefill?.id              || '',
            parkingPlaceName: prefill?.parkingName     || '',
            parkingLocation:  prefill?.location        || '',
            pricePerHour:     prefill?.price           || '',
        };
    }, [userData]);

    // ── Load the driver's vehicles ────────────────────────
    const loadMyVehicles = useCallback(async () => {
        const userId = userData?.id || localStorage.getItem('userId');
        if (!userId) return;
        try {
            const { data } = await axios.get(
                `http://localhost:8080/api/vehicles/user/${userId}`,
                { headers: getHeaders() }
            );
            setMyVehicles(data || []);
        } catch { /* silent — vehicle list just stays empty */ }
    }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { loadMyVehicles(); }, [loadMyVehicles]);

    // ── Load slots when parkingPlaceId changes ────────────
    useEffect(() => {
        const id = form.parkingPlaceId;
        if (!id) { setParkingSlots([]); return; }

        setSlotsLoading(true);
        axios.get(`http://localhost:8080/api/slots/place/${id}`, { headers: getHeaders() })
            .then(r => setParkingSlots(r.data || []))
            .catch(() => setParkingSlots([]))
            .finally(() => setSlotsLoading(false));
    }, [form.parkingPlaceId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auto-open form from "Book Now" ────────────────────
    useEffect(() => {
        if (autoOpenForm && prefillData) {
            const newForm = buildForm(prefillData);
            setForm(newForm);
            setEditingId(null);
            setFormErrors({});
            // Small delay: let the scroll animation finish before the form pops open
            const t = setTimeout(() => {
                setShowForm(true);
                if (onFormOpenHandled) onFormOpenHandled();
            }, 400);
            return () => clearTimeout(t);
        }
    }, [autoOpenForm, prefillData, buildForm, onFormOpenHandled]);

    // ── Load reservations ─────────────────────────────────
    const loadReservations = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                'http://localhost:8080/api/reservations/my',
                { headers: getHeaders() }
            );
            setReservations(data || []);
        } catch {
            showError('Failed to load reservations. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { loadReservations(); }, [loadReservations]);

    // ── Auto-calculate duration & total ───────────────────
    useEffect(() => {
        if (form.startTime && form.endTime) {
            const dur   = calcDuration(form.startTime, form.endTime);
            const total = dur && form.pricePerHour
                ? Math.round(parseFloat(form.pricePerHour) * dur * 100) / 100
                : '';
            setForm(f => ({ ...f, duration: dur, totalAmount: total }));
        }
    }, [form.startTime, form.endTime, form.pricePerHour]);

    // ── When driver selects a vehicle, auto-fill fields ───
    const handleVehicleSelect = (vehicleId) => {
        const v = myVehicles.find(v => String(v.id) === String(vehicleId));
        if (!v) { setForm(f => ({ ...f, vehicleId: '', vehicleNumber: '', vehicleType: 'Car' })); return; }
        setForm(f => ({
            ...f,
            vehicleId:     v.id,
            vehicleNumber: v.vehicleNumber,
            vehicleType:   v.type || 'Car',
        }));
    };

    // ── When driver selects a slot ────────────────────────
    const handleSlotSelect = (slot) => {
        if (slot.slotStatus !== 'Available') return; // block unavailable
        setForm(f => ({ ...f, slotId: slot.id, slotNumber: slot.slotName }));
    };

    const resetForm = () => {
        setForm(buildForm());
        setEditingId(null);
        setFormErrors({});
        setShowForm(false);
        setParkingSlots([]);
    };

    const validateForm = () => {
        const e = {};
        if (!form.parkingPlaceId)         e.parkingPlaceName = 'Parking place is required — use Book Now from the map';
        if (!form.slotNumber.trim())      e.slotNumber       = 'Please select a parking slot';
        if (!form.vehicleId && !form.vehicleNumber.trim()) e.vehicleId = 'Please select a vehicle';
        if (!form.reservationDate)        e.reservationDate  = 'Reservation date is required';
        if (!form.startTime)              e.startTime        = 'Start time is required';
        if (!form.endTime)                e.endTime          = 'End time is required';
        setFormErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;
        setSaving(true);
        setError('');
        try {
            const payload = {
                driverName:      form.driverName,
                parkingPlaceId:  Number(form.parkingPlaceId),
                slotId:          form.slotId ? Number(form.slotId) : null,
                slotNumber:      form.slotNumber,
                vehicleNumber:   form.vehicleNumber,
                vehicleType:     form.vehicleType,
                reservationDate: form.reservationDate,
                startTime:       form.startTime,
                endTime:         form.endTime,
                paymentStatus:   'PENDING',   // always PENDING on creation
                status:          'PENDING',   // always PENDING on creation
            };

            if (editingId) {
                await axios.put(
                    `http://localhost:8080/api/reservations/update/${editingId}`,
                    payload, { headers: getHeaders() }
                );
                showSuccess('Reservation updated successfully!');
            } else {
                await axios.post(
                    'http://localhost:8080/api/reservations/book',
                    payload, { headers: getHeaders() }
                );
                showSuccess('Reservation booked successfully! You will receive a confirmation shortly.');
            }
            resetForm();
            loadReservations();
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || err.message;
            showError(typeof msg === 'string' ? msg : 'Failed to save reservation. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = r => {
        setForm({
            driverName:       r.driverName       || '',
            driverId:         r.driverId         || '',
            parkingPlaceId:   r.parkingPlaceId   || '',
            parkingPlaceName: r.parkingName      || '',
            parkingLocation:  r.parkingLocation  || '',
            slotId:           r.slotId           || '',
            slotNumber:       r.slotNumber       || '',
            vehicleId:        '',
            vehicleNumber:    r.vehicleNumber    || '',
            vehicleType:      r.vehicleType      || 'Car',
            reservationDate:  r.reservationDate  || '',
            startTime:        r.startTime        || '',
            endTime:          r.endTime          || '',
            duration:         r.duration         || '',
            totalAmount:      r.totalAmount      || '',
            pricePerHour:     r.pricePerHour     || '',
        });
        setEditingId(r.id);
        setFormErrors({});
        setShowForm(true);
    };

    const handleCancel = async id => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
        try {
            await axios.put(
                `http://localhost:8080/api/reservations/cancel/${id}`, {},
                { headers: getHeaders() }
            );
            showSuccess('Reservation cancelled.');
            loadReservations();
        } catch (err) {
            showError(err.response?.data?.error || 'Failed to cancel reservation.');
        }
    };

    // ─────────────────────────────────────────────────────
    //  Render
    // ─────────────────────────────────────────────────────
    const availableSlots   = parkingSlots.filter(s => s.slotStatus === 'Available').length;
    const totalSlots       = parkingSlots.length;

    return (
        <div className="resv-container">

            {/* ── Page Header ── */}
            <div className="resv-header" style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '5px' }}>
                <button className="resv-add-btn"
                    onClick={() => { setForm(buildForm()); setEditingId(null); setFormErrors({}); setShowForm(true); }}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Create Reservation
                </button>
            </div>

            {/* ── Alerts ── */}
            {successMsg && (
                <div className="alert-success">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMsg}
                </div>
            )}
            {error && (
                <div className="alert-error">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {/* ── Stats Strip ── */}
            <div className="resv-stats-strip">
                {[
                    { label: 'Total',     count: reservations.length,                                        color: P.beige,   icon: 'receipt_long'   },
                    { label: 'Confirmed', count: reservations.filter(r => r.status === 'CONFIRMED').length,  color: P.green,   icon: 'event_available' },
                    { label: 'Pending',   count: reservations.filter(r => r.status === 'PENDING').length,    color: P.primary, icon: 'pending'         },
                    { label: 'Completed', count: reservations.filter(r => r.status === 'COMPLETED').length,  color: P.slate,   icon: 'task_alt'        },
                ].map(s => (
                    <div key={s.label} className="resv-stat-card" style={{ borderBottom: `3px solid ${s.color}` }}>
                        <span className="material-symbols-outlined resv-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                        <div>
                            <p className="resv-stat-count" style={{ color: s.color }}>{s.count}</p>
                            <p className="resv-stat-label">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Reservation Table ── */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" style={{ borderTopColor: P.primary }}></div>
                    <p>Loading reservations...</p>
                </div>
            ) : reservations.length > 0 ? (
                <div className="table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Res. ID</th>
                                <th>Driver</th>
                                <th>Parking Place</th>
                                <th>Slot</th>
                                <th>Date</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map(r => (
                                <tr key={r.id}>
                                    <td><span className="resv-id-chip">#{r.id}</span></td>
                                    <td>
                                        <div className="resv-driver-cell">
                                            <span className="resv-driver-avatar">
                                                {(r.driverName || 'D').charAt(0).toUpperCase()}
                                            </span>
                                            <span>{r.driverName || '—'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="resv-place-name">{r.parkingName || '—'}</p>
                                        <p className="resv-place-loc">{r.parkingLocation || ''}</p>
                                    </td>
                                    <td><span className="resv-slot-chip">{r.slotNumber || '—'}</span></td>
                                    <td>{r.reservationDate || '—'}</td>
                                    <td>{r.startTime  || '—'}</td>
                                    <td>{r.endTime    || '—'}</td>
                                    <td><StatusBadge status={r.status        || 'PENDING'} /></td>
                                    <td>
                                        {(r.paymentStatus === 'PENDING' || !r.paymentStatus) ? (
                                            <button 
                                                className="resv-pay-badge resv-pay-action-btn"
                                                onClick={() => onNavigateToPayment && onNavigateToPayment()}
                                                title="Click to Pay Now"
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px' }}>account_balance_wallet</span>
                                                Pay Now
                                            </button>
                                        ) : (
                                            <PayBadge status={r.paymentStatus || 'PENDING'} />
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                            <button className="btn-edit resv-btn-view" title="View" onClick={() => setViewItem(r)}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                                            </button>
                                            {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                                                <>
                                                    <button className="btn-edit" title="Edit" onClick={() => handleEdit(r)}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                    </button>
                                                    <button className="btn-delete" title="Cancel" onClick={() => handleCancel(r.id)}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="resv-empty-icon-wrap">
                        <span className="material-symbols-outlined icon-center" style={{ fontSize: '2.4rem', color: P.primary }}>book_online</span>
                    </div>
                    <h3>No reservations yet</h3>
                    <p>Click <strong>Book Now</strong> on any parking place on the map to get started.</p>
                </div>
            )}

            {/* ══════════════════════════════════════════════
                CREATE / EDIT FORM MODAL
            ══════════════════════════════════════════════ */}
            {showForm && (
                <div className="form-modal"
                    style={{ top: '75px', padding: '8px 16px', alignItems: 'center', justifyContent: 'center' }}
                    onClick={e => e.target === e.currentTarget && resetForm()}>
                    <div className="form-modal-content resv-modal-wide">

                        {/* Identity stripe */}
                        <div className="sc-modal-stripe"
                            style={{ background: P.primaryBg, borderBottom: `2px solid ${P.primaryBdr}` }}>
                            <div className="sc-modal-badge">
                                <span className="material-symbols-outlined sc-modal-cat-icon icon-center"
                                    style={{ color: P.primary }}>book_online</span>
                                <div>
                                    <div className="sc-modal-cat-label">Reservation Management</div>
                                    <div className="sc-modal-cat-name" style={{ color: P.primary }}>
                                        {editingId ? `Edit Reservation #${editingId}` : 'New Reservation'}
                                    </div>
                                </div>
                            </div>
                            <button className="close-btn" onClick={resetForm}>&times;</button>
                        </div>

                        <div className="form-header" style={{ borderBottom: 'none', paddingBottom: '4px' }}>
                            <h2>{editingId ? `Edit Reservation #${editingId}` : 'Create New Reservation'}</h2>
                        </div>

                        <form className="inventory-form" onSubmit={handleSubmit} noValidate style={{ paddingTop: '2px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>

                            {/* ══ LEFT COLUMN ══ */}
                            <div>

                            {/* ── Section: Driver ── */}
                            <div className="resv-section-divider">
                                <span className="material-symbols-outlined">person</span>
                                Driver Information
                            </div>
                            <div className="resv-row">
                                <div className="form-group">
                                    <label>Driver Name</label>
                                    <input type="text" value={form.driverName} readOnly className="resv-readonly"
                                        placeholder="Auto-filled from account" />
                                </div>
                                <div className="form-group">
                                    <label>Driver ID</label>
                                    <input type="text" value={form.driverId} readOnly className="resv-readonly" />
                                </div>
                            </div>

                            {/* ── Section: Vehicle Selection ── */}
                            <div className="resv-section-divider">
                                <span className="material-symbols-outlined">directions_car</span>
                                Vehicle Selection
                            </div>

                            {myVehicles.length === 0 ? (
                                <div className="resv-no-vehicles">
                                    <span className="material-symbols-outlined">directions_car</span>
                                    <p>No vehicles registered yet. <br />Please add a vehicle from <strong>My Vehicles</strong> section first.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="resv-vehicle-grid">
                                        {myVehicles.map(v => {
                                            const selected = String(form.vehicleId) === String(v.id);
                                            const typeIcon = v.type === 'Bike' ? 'two_wheeler'
                                                : v.type === 'EV'   ? 'electric_car' : 'directions_car';
                                            return (
                                                <div key={v.id}
                                                    className={`resv-vehicle-card ${selected ? 'selected' : ''}`}
                                                    onClick={() => handleVehicleSelect(v.id)}>
                                                    <span className="material-symbols-outlined resv-veh-icon"
                                                        style={{ color: selected ? P.primary : P.taupe }}>
                                                        {typeIcon}
                                                    </span>
                                                    <div className="resv-veh-info">
                                                        <strong>{v.vehicleNumber}</strong>
                                                        <span>{v.brand} {v.model}</span>
                                                        <span className="resv-veh-type">{v.type}</span>
                                                    </div>
                                                    {selected && (
                                                        <span className="material-symbols-outlined resv-veh-check">check_circle</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {formErrors.vehicleId && (
                                        <span className="error-text" style={{ marginBottom: '12px', display: 'block' }}>
                                            {formErrors.vehicleId}
                                        </span>
                                    )}
                                </>
                            )}

                            </div> {/* end LEFT COLUMN */}

                            {/* ══ RIGHT COLUMN ══ */}
                            <div>

                            {/* ── Section: Parking Details ── */}
                            <div className="resv-section-divider">
                                <span className="material-symbols-outlined">local_parking</span>
                                Parking Details
                            </div>
                            <div className="form-group">
                                <label>Parking Place Name *</label>
                                <input
                                    type="text"
                                    value={form.parkingPlaceName}
                                    readOnly
                                    className={`resv-readonly ${formErrors.parkingPlaceName ? 'input-error' : ''}`}
                                    placeholder="Select a parking place from the map and click Book Now"
                                />
                                {formErrors.parkingPlaceName && (
                                    <span className="error-text">{formErrors.parkingPlaceName}</span>
                                )}
                            </div>

                            {/* ── Slot Grid ── */}
                            {form.parkingPlaceId && (
                                <>
                                    <div className="resv-slot-header">
                                        <span className="material-symbols-outlined">grid_view</span>
                                        <span>Select a Parking Slot</span>
                                        {!slotsLoading && totalSlots > 0 && (
                                            <span className="resv-slot-availability">
                                                <span style={{ color: P.green, fontWeight: 700 }}>{availableSlots}</span>
                                                <span style={{ color: P.taupe }}> / {totalSlots} available</span>
                                            </span>
                                        )}
                                    </div>

                                    {slotsLoading ? (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 0', color: P.taupe }}>
                                            <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', borderTopColor: P.primary }}></div>
                                            <span style={{ fontSize: '0.88rem' }}>Loading slots...</span>
                                        </div>
                                    ) : totalSlots === 0 ? (
                                        <div className="resv-no-slots">
                                            <span className="material-symbols-outlined">garage</span>
                                            <p>No slots found for this parking place.</p>
                                        </div>
                                    ) : (
                                        <div className="resv-slot-grid">
                                            {parkingSlots.map(slot => {
                                                const cfg       = SLOT_STATUS_COLOR[slot.slotStatus] || SLOT_STATUS_COLOR['Unavailable'];
                                                const available = slot.slotStatus === 'Available';
                                                const selected  = String(form.slotId) === String(slot.id);
                                                return (
                                                    <div key={slot.id}
                                                        className={`resv-slot-tile ${selected ? 'selected' : ''} ${!available ? 'disabled' : ''}`}
                                                        style={{
                                                            background: selected ? P.primaryBg : cfg.bg,
                                                            border: selected
                                                                ? `2px solid ${P.primary}`
                                                                : `1.5px solid ${cfg.border}`,
                                                            cursor: available ? 'pointer' : 'not-allowed',
                                                        }}
                                                        onClick={() => handleSlotSelect(slot)}
                                                        title={`${slot.slotName} — ${slot.slotStatus}${slot.slotType ? ` (${slot.slotType})` : ''}`}>
                                                        <span className="resv-slot-dot"
                                                            style={{ background: selected ? P.primary : cfg.dot }}></span>
                                                        <span className="resv-slot-name"
                                                            style={{ color: selected ? P.primary : cfg.text }}>
                                                            {slot.slotName}
                                                        </span>
                                                        {slot.slotType && (
                                                            <span className="resv-slot-type">{slot.slotType}</span>
                                                        )}
                                                        {!available && (
                                                            <span className="material-symbols-outlined resv-slot-lock"
                                                                style={{ color: cfg.text }}>lock</span>
                                                        )}
                                                        {selected && (
                                                            <span className="material-symbols-outlined resv-slot-check">check_circle</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {/* Legend */}
                                    {totalSlots > 0 && (
                                        <div className="resv-slot-legend">
                                            {Object.entries(SLOT_STATUS_COLOR).map(([label, cfg]) => (
                                                <span key={label} className="resv-legend-item">
                                                    <span className="resv-legend-dot" style={{ background: cfg.dot }}></span>
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {formErrors.slotNumber && (
                                        <span className="error-text" style={{ display: 'block', marginBottom: '8px' }}>
                                            {formErrors.slotNumber}
                                        </span>
                                    )}
                                </>
                            )}

                            {/* ── Section: Schedule ── */}
                            <div className="resv-section-divider">
                                <span className="material-symbols-outlined">schedule</span>
                                Booking Schedule
                            </div>
                            <div className="resv-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                <div className="form-group">
                                    <label>Reservation Date *</label>
                                    <input
                                        type="date"
                                        value={form.reservationDate}
                                        onChange={e => setForm(f => ({ ...f, reservationDate: e.target.value }))}
                                        className={formErrors.reservationDate ? 'input-error' : ''}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {formErrors.reservationDate && <span className="error-text">{formErrors.reservationDate}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Start Time *</label>
                                    <input
                                        type="time"
                                        value={form.startTime}
                                        onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                                        className={formErrors.startTime ? 'input-error' : ''}
                                    />
                                    {formErrors.startTime && <span className="error-text">{formErrors.startTime}</span>}
                                </div>
                                <div className="form-group">
                                    <label>End Time *</label>
                                    <input
                                        type="time"
                                        value={form.endTime}
                                        onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                                        className={formErrors.endTime ? 'input-error' : ''}
                                    />
                                    {formErrors.endTime && <span className="error-text">{formErrors.endTime}</span>}
                                </div>
                            </div>

                            {/* ── Section: Pricing (display only) ── */}
                            <div className="resv-section-divider">
                                <span className="material-symbols-outlined">payments</span>
                                Pricing Summary
                            </div>
                            <div className="resv-row">
                                <div className="form-group">
                                    <label>Duration (hours)</label>
                                    <input type="text" value={form.duration || ''} readOnly
                                        className="resv-readonly" placeholder="Auto-calculated" />
                                </div>
                                <div className="form-group">
                                    <label>Total Amount (Rs.)</label>
                                    <input type="text"
                                        value={form.totalAmount !== '' && form.totalAmount !== undefined
                                            ? `Rs. ${form.totalAmount}` : ''}
                                        readOnly className="resv-readonly resv-amount-display"
                                        placeholder="Auto-calculated" />
                                </div>
                            </div>

                            </div> {/* end RIGHT COLUMN */}
                            </div> {/* end two-column grid */}

                            {/* ── Actions (full width) ── */}
                            <div className="form-actions"
                                style={{ borderTop: `1px solid ${P.primaryBdr}`, paddingTop: '16px' }}>
                                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                                <button
                                    type="submit"
                                    className="btn-submit resv-submit-btn"
                                    disabled={saving || (myVehicles.length === 0 && !editingId)}
                                    style={{ background: saving ? '#c4bdb6' : P.primary }}>
                                    {saving ? 'Booking...' : editingId ? 'Update Reservation' : 'Book Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════
                VIEW DETAILS MODAL
            ══════════════════════════════════════════════ */}
            {viewItem && (
                <div className="form-modal"
                    style={{ top: '75px', padding: '8px 16px', alignItems: 'center', justifyContent: 'center' }}
                    onClick={e => e.target === e.currentTarget && setViewItem(null)}>
                    <div className="form-modal-content" style={{ maxWidth: '700px', width: '100%', borderRadius: '22px' }}>
                        <div className="sc-modal-stripe"
                            style={{ background: P.slateBg, borderBottom: `2px solid ${P.slateBdr}` }}>
                            <div className="sc-modal-badge">
                                <span className="material-symbols-outlined sc-modal-cat-icon icon-center"
                                    style={{ color: P.slate }}>receipt_long</span>
                                <div>
                                    <div className="sc-modal-cat-label">Reservation Details</div>
                                    <div className="sc-modal-cat-name" style={{ color: P.slate }}>#{viewItem.id}</div>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setViewItem(null)}>&times;</button>
                        </div>
                        <div className="inventory-form">
                            <div className="resv-view-grid">
                                {[
                                    ['Driver Name',    viewItem.driverName],
                                    ['Parking Place',  viewItem.parkingName],
                                    ['Location',       viewItem.parkingLocation || '—'],
                                    ['Slot Number',    viewItem.slotNumber      || '—'],
                                    ['Vehicle Number', viewItem.vehicleNumber   || '—'],
                                    ['Vehicle Type',   viewItem.vehicleType     || '—'],
                                    ['Date',           viewItem.reservationDate || '—'],
                                    ['Start Time',     viewItem.startTime       || '—'],
                                    ['End Time',       viewItem.endTime         || '—'],
                                    ['Duration',       viewItem.duration ? `${viewItem.duration} hrs` : '—'],
                                    ['Rate / Hr',      viewItem.pricePerHour ? `Rs. ${viewItem.pricePerHour}` : '—'],
                                    ['Total Amount',   viewItem.totalAmount ? `Rs. ${viewItem.totalAmount}` : '—'],
                                ].map(([label, val]) => (
                                    <div key={label} className="resv-view-item">
                                        <span className="resv-view-label">{label}</span>
                                        <span className="resv-view-val">{val}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="form-actions"
                                style={{ borderTop: `1px solid ${P.slateBdr}`, paddingTop: '16px' }}>
                                <button type="button" className="btn-cancel" onClick={() => setViewItem(null)}>
                                    Close
                                </button>
                                {viewItem.status !== 'CANCELLED' && viewItem.status !== 'COMPLETED' && (
                                    <button className="btn-submit resv-submit-btn" style={{ background: P.primary }}
                                        onClick={() => { setViewItem(null); handleEdit(viewItem); }}>
                                        Edit Reservation
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationManagement;
