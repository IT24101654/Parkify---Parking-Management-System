import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ServiceCenterDashboard.css';

// ── Category-specific config (muted dashboard palette) ──────────────────────
const CATEGORY_CONFIG = {
    'Car Wash': {
        icon: 'local_car_wash',
        color: '#9b8c7b',
        bg: '#f5f2ee',
        border: '#ddd6cc',
        namePlaceholder: 'e.g. Basic Exterior Wash, Premium Detailing...',
        timePlaceholder: 'e.g. 45 mins',
        descPlaceholder: 'Describe what is included (exterior, interior, wax, polish...)',
        suggestions: ['Basic Exterior Wash', 'Full Detailing', 'Interior + Exterior', 'Wax & Polish'],
    },
    'Oil Change': {
        icon: 'oil_barrel',
        color: '#7d8570',
        bg: '#f2f3f0',
        border: '#cdd0c8',
        namePlaceholder: 'e.g. Synthetic Oil Change, Filter Replacement...',
        timePlaceholder: 'e.g. 30 mins',
        descPlaceholder: 'Describe the oil grade, brand, filter type...',
        suggestions: ['Standard Oil Change', 'Synthetic Oil & Filter', 'Full Flush Service'],
    },
    'Tire Service': {
        icon: 'tire_repair',
        color: '#738189',
        bg: '#f0f2f4',
        border: '#c8cdd2',
        namePlaceholder: 'e.g. Tire Rotation, Puncture Repair, Balancing...',
        timePlaceholder: 'e.g. 20 mins',
        descPlaceholder: 'Describe the service (rotation, balancing, alignment, replacement...)',
        suggestions: ['Tire Rotation', 'Puncture Repair', 'Wheel Balancing', 'Tire Replacement'],
    },
    'Battery Service': {
        icon: 'battery_charging_full',
        color: '#8b9aa6',
        bg: '#f0f3f5',
        border: '#c8d0d8',
        namePlaceholder: 'e.g. Battery Test, Jump Start, Terminal Cleaning...',
        timePlaceholder: 'e.g. 15 mins',
        descPlaceholder: 'Describe what is included (test, charging, replacement brand, warranty...)',
        suggestions: ['Battery Test', 'Battery Replacement', 'Jump Start Service', 'Terminal Cleaning'],
    },
    'Full Service': {
        icon: 'engineering',
        color: '#a09282',
        bg: '#f6f3f0',
        border: '#d8d0c8',
        namePlaceholder: 'e.g. Service A (Minor), Annual Full Package...',
        timePlaceholder: 'e.g. 3 hours',
        descPlaceholder: 'List all items covered in this full service package...',
        suggestions: ['Service A (Minor)', 'Service B (Major)', 'Annual Full Package', 'Pre-Sale Inspection'],
    },
    'Other Repairs': {
        icon: 'handyman',
        color: '#ae958b',
        bg: '#f5f1ef',
        border: '#ddd0cb',
        namePlaceholder: 'e.g. Air Filter, AC Recharge, Brake Pad Replacement...',
        timePlaceholder: 'e.g. 1 hour',
        descPlaceholder: 'Describe the repair, parts used, and what is included...',
        suggestions: ['Air Filter Replacement', 'AC Recharge', 'Brake Pad Replacement', 'Spark Plug Change'],
    },
};

const DEFAULT_CONFIG = {
    icon: 'build',
    color: '#9b8c7b',
    bg: '#f5f2ee',
    border: '#ddd6cc',
    namePlaceholder: 'e.g. Service name...',
    timePlaceholder: 'e.g. 30 mins',
    descPlaceholder: 'Describe what this service includes...',
    suggestions: [],
};
// ────────────────────────────────────────────────────────────────────────────

const ManageServiceItems = ({ selectedCategory, serviceCenterId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        category: selectedCategory || '',
        description: '',
        price: '',
        estimatedTime: ''
    });

    // Pick config for current category
    const cfg = CATEGORY_CONFIG[selectedCategory] || DEFAULT_CONFIG;

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const showError = (msg) => {
        setError(msg);
        setTimeout(() => setError(''), 5000);
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const loadItems = useCallback(async () => {
        if (!serviceCenterId || !selectedCategory) return;
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(
                `http://localhost:8080/api/service-items/center/${serviceCenterId}`,
                { headers: getHeaders() }
            );
            // Filter by category (case-insensitive)
            const filtered = (response.data || []).filter(item =>
                (item.category || '').toLowerCase() === (selectedCategory || '').toLowerCase()
            );
            setItems(filtered);
        } catch (err) {
            console.error('Error fetching service items:', err);
            showError('Failed to load services. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, serviceCenterId]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const resetForm = () => {
        setForm({ name: '', category: selectedCategory, description: '', price: '', estimatedTime: '' });
        setFormErrors({});
        setEditingId(null);
        setShowForm(false);
    };

    const validateForm = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Service name is required';
        if (!form.price || parseFloat(form.price) <= 0) errors.price = 'Price must be greater than 0';
        if (!form.estimatedTime.trim()) errors.estimatedTime = 'Estimated time is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        setError('');

        try {
            const payload = {
                name: form.name.trim(),
                category: selectedCategory,          // always locked to current category
                description: form.description.trim(),
                price: parseFloat(form.price),
                estimatedTime: form.estimatedTime.trim(),
                serviceCenterId: serviceCenterId
            };

            if (editingId) {
                await axios.put(
                    `http://localhost:8080/api/service-items/${editingId}`,
                    payload,
                    { headers: getHeaders() }
                );
                showSuccess(`${selectedCategory} service updated successfully!`);
            } else {
                await axios.post(
                    'http://localhost:8080/api/service-items/add',
                    payload,
                    { headers: getHeaders() }
                );
                showSuccess(`${selectedCategory} service added successfully!`);
            }

            resetForm();
            loadItems();
        } catch (err) {
            console.error('Service save error:', err);
            // Surface the actual server error message if available
            const serverMsg = err.response?.data?.error
                || err.response?.data?.message
                || err.response?.data
                || err.message;
            const displayMsg = (typeof serverMsg === 'string' && serverMsg.length < 200)
                ? serverMsg
                : 'Failed to save service. Please check the server logs.';
            showError(displayMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setForm({
            name: item.name,
            category: item.category,
            description: item.description || '',
            price: item.price,
            estimatedTime: item.estimatedTime
        });
        setEditingId(item.id);
        setFormErrors({});
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await axios.delete(
                `http://localhost:8080/api/service-items/${id}`,
                { headers: getHeaders() }
            );
            showSuccess('Service deleted successfully!');
            loadItems();
        } catch (err) {
            console.error('Service delete error:', err);
            const serverMsg = err.response?.data?.error || err.message;
            showError(serverMsg || 'Failed to delete service.');
        }
    };

    return (
        <div className="manage-inventory-container">

            {/* ── Page header ── */}
            <div className="inventory-header">
                <div className="header-text" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                        className="material-symbols-outlined sc-header-icon icon-center"
                        style={{ color: cfg.color, background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
                    >
                        {cfg.icon}
                    </span>
                    <h1>{selectedCategory} Management</h1>
                </div>
                <button
                    className="add-item-btn"
                    style={{ background: cfg.color, boxShadow: `0 3px 10px ${cfg.color}44` }}
                    onClick={() => { resetForm(); setShowForm(true); }}
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Add {selectedCategory} Service
                </button>
            </div>

            {/* ── Alerts ── */}
            {successMessage && (
                <div className="alert-success">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="alert-error">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </div>
            )}

            {/* ── Dynamic Category Modal ── */}
            {showForm && (
                <div className="form-modal" onClick={(e) => e.target === e.currentTarget && resetForm()}>
                    <div className="form-modal-content">

                        {/* Category identity stripe */}
                        <div className="sc-modal-stripe" style={{ background: cfg.bg, borderBottom: `2px solid ${cfg.border}` }}>
                            <div className="sc-modal-badge">
                                <span
                                    className="material-symbols-outlined sc-modal-cat-icon icon-center"
                                    style={{ color: cfg.color }}
                                >
                                    {cfg.icon}
                                </span>
                                <div>
                                    <div className="sc-modal-cat-label">Managing Category</div>
                                    <div className="sc-modal-cat-name" style={{ color: cfg.color }}>
                                        {selectedCategory}
                                    </div>
                                </div>
                            </div>
                            <button className="close-btn" onClick={resetForm}>&times;</button>
                        </div>

                        {/* Modal title */}
                        <div className="form-header" style={{ borderBottom: 'none', paddingBottom: '4px' }}>
                            <h2>
                                {editingId
                                    ? `Edit ${selectedCategory} Service`
                                    : `Add New ${selectedCategory} Service`}
                            </h2>
                        </div>

                        <form className="inventory-form" onSubmit={handleSubmit} noValidate style={{ paddingTop: '4px' }}>

                            {/* Quick suggestions — only on Add mode */}
                            {!editingId && cfg.suggestions.length > 0 && (
                                <div className="form-group">
                                    <label>Quick Suggestions</label>
                                    <div className="sc-suggestion-chips">
                                        {cfg.suggestions.map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                className="sc-chip"
                                                style={{
                                                    borderColor: form.name === s ? cfg.color : cfg.border,
                                                    color: cfg.color,
                                                    background: form.name === s ? cfg.bg : '#faf9f7',
                                                }}
                                                onClick={() => setForm(f => ({ ...f, name: s }))}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Service Name */}
                            <div className="form-group">
                                <label>Service Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className={formErrors.name ? 'input-error' : ''}
                                    placeholder={cfg.namePlaceholder}
                                    autoFocus
                                    style={{ '--focus-color': cfg.color }}
                                />
                                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                            </div>

                            {/* Price + Time */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Price (Rs.) *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        className={formErrors.price ? 'input-error' : ''}
                                        placeholder="e.g. 1500"
                                    />
                                    {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Estimated Time *</label>
                                    <input
                                        type="text"
                                        placeholder={cfg.timePlaceholder}
                                        value={form.estimatedTime}
                                        onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
                                        className={formErrors.estimatedTime ? 'input-error' : ''}
                                    />
                                    {formErrors.estimatedTime && (
                                        <span className="error-text">{formErrors.estimatedTime}</span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label>
                                    Description{' '}
                                    <span style={{ fontWeight: 400, color: '#a0aec0', fontSize: '0.82rem' }}>(optional)</span>
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder={cfg.descPlaceholder}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            {/* Actions */}
                            <div className="form-actions" style={{ borderTop: '1px solid #ede9e3', paddingTop: '16px' }}>
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={saving}
                                    style={{ background: saving ? '#c4bdb6' : cfg.color }}
                                >
                                    {saving ? 'Saving...' : (editingId ? 'Update Service' : `Save Service`)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Table / Empty / Loading ── */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner" style={{ borderTopColor: cfg.color }}></div>
                    <p>Loading {selectedCategory} services...</p>
                </div>
            ) : items.length > 0 ? (
                <div className="table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Service Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Est. Time</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="material-symbols-outlined icon-center" style={{ fontSize: '16px', color: cfg.color }}>
                                                {cfg.icon}
                                            </span>
                                            <span className="item-name">{item.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="sc-category-pill"
                                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td><strong>Rs. {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</strong></td>
                                    <td>{item.estimatedTime}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                            <button className="btn-edit" title="Edit" onClick={() => handleEdit(item)}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                            </button>
                                            <button className="btn-delete" title="Delete" onClick={() => handleDelete(item.id)}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="sc-empty-icon-wrap" style={{ background: cfg.bg, border: `2px solid ${cfg.border}` }}>
                        <span className="material-symbols-outlined icon-center" style={{ fontSize: '2.2rem', color: cfg.color }}>{cfg.icon}</span>
                    </div>
                    <h3>No {selectedCategory} services yet</h3>
                    <p>Click <strong>Add {selectedCategory} Service</strong> to get started.</p>
                </div>
            )}
        </div>
    );
};

export default ManageServiceItems;
