import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Inventory.css';

const ManageInventory = ({ selectedType, parkingPlaceId }) => {
    const { type: urlType } = useParams();


    const type = selectedType || urlType || window.location.pathname.split('/').pop();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const userRole = localStorage.getItem('userRole') || 'PARKING_OWNER';

    const [form, setForm] = useState({
        itemName: '',
        quantity: '',
        thresholdValue: '',
        unitPrice: '',
        category: '',
        supplier: '',
        expiryDate: '',
        lastRestockDate: ''
    });

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const loadItems = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            let endpoint = '';
            if (userRole === 'PARKING_OWNER') {
                endpoint = 'http://localhost:8080/api/inventory/owner';
                console.log("OWNER-LEVEL: Fetching shared inventory for owner.");
            } else {
                const safePlaceId = parkingPlaceId ? Number(parkingPlaceId) : null;
                if (!safePlaceId || isNaN(safePlaceId)) {
                    console.warn("DRIVER-LEVEL: Invalid or missing Place ID. Component will not fetch.");
                    setItems([]);
                    setLoading(false);
                    return;
                }
                endpoint = `http://localhost:8080/api/inventory/by-parking-place/${safePlaceId}`;
                console.log("DRIVER-LEVEL: Fetching inventory for parking place:", safePlaceId);
            }

            const response = await axios.get(endpoint, { headers: getHeaders() });
            const allItems = Array.isArray(response.data) ? response.data : [];

            const filtered = allItems.filter(item => {
                const itemType = (item.inventoryType || '').toUpperCase();
                const requestedType = (type || '').toUpperCase();

                let match = false;
                if (requestedType === 'FOOD') {
                    match = itemType.includes('FOOD') || itemType.includes('BEVERAGE') || itemType.includes('RESTAURANT');
                } else if (requestedType === 'SPARE_PART') {
                    match = itemType.includes('SPARE') || itemType.includes('PART');
                } else if (requestedType === 'FUEL') {
                    match = itemType.includes('FUEL') || itemType.includes('OIL') || itemType.includes('GAS');
                } else {
                    match = itemType === requestedType;
                }
                return match;
            });

            setItems(filtered);
        } catch (err) {
            console.error('Inventory Fetch Error:', err);
            setError('Failed to load items.');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [type, parkingPlaceId, userRole]);

    useEffect(() => {
        if (type) {
            loadItems();
        }
    }, [type, loadItems]);

    const validateForm = () => {
        const errors = {};

        if (!form.itemName.trim()) {
            errors.itemName = 'Item name is required';
        }

        if (form.quantity === '' || parseFloat(form.quantity) < 0) {
            errors.quantity = 'Quantity must be a positive number';
        }

        if (form.unitPrice === '' || parseFloat(form.unitPrice) < 0) {
            errors.unitPrice = 'Price must be a positive number';
        }

        if (form.thresholdValue === '' || parseFloat(form.thresholdValue) < 0) {
            errors.thresholdValue = 'Threshold must be a positive number';
        }

        if (type === 'FOOD') {
            if (!form.expiryDate) {
                errors.expiryDate = 'Expiry date is required';
            }
        } else if (type === 'SPARE_PART') {
            if (!form.category.trim()) {
                errors.category = 'Vehicle type/category is required';
            }
            if (!form.supplier.trim()) {
                errors.supplier = 'Supplier is required';
            }
        } else if (type === 'FUEL') {
            if (!['Petrol', 'Diesel'].includes(form.itemName)) {
                errors.itemName = 'Fuel type must be Petrol or Diesel';
            }
            if (!form.supplier.trim()) {
                errors.supplier = 'Supplier is required';
            }
            if (!form.lastRestockDate) {
                errors.lastRestockDate = 'Last restock date is required';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setError('');
            const payload = {
                itemName: form.itemName,
                quantity: parseFloat(form.quantity),
                thresholdValue: parseFloat(form.thresholdValue),
                unitPrice: parseFloat(form.unitPrice),
                inventoryType: type
            };

            if (type === 'FOOD') {
                payload.expiryDate = form.expiryDate;
            } else if (type === 'SPARE_PART') {
                payload.category = form.category;
                payload.supplier = form.supplier;
            } else if (type === 'FUEL') {
                payload.supplier = form.supplier;
                payload.lastRestockDate = form.lastRestockDate;
            }

            if (editingId) {
                await axios.put(
                    `http://localhost:8080/api/inventory/${editingId}`,
                    payload,
                    { headers: getHeaders() }
                );
                setSuccessMessage('Item updated successfully!');
            } else {
                await axios.post(
                    'http://localhost:8080/api/inventory/add',
                    payload,
                    { headers: getHeaders() }
                );
                setSuccessMessage('Item added successfully!');
            }

            resetForm();
            loadItems();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error saving item:', err);
            setError(err.response?.data?.message || 'Failed to save item');
        }
    };

    const handleEdit = (item) => {
        setForm({
            itemName: item.itemName || '',
            quantity: item.quantity || '',
            thresholdValue: item.thresholdValue || '',
            unitPrice: item.unitPrice || '',
            category: item.category || '',
            supplier: item.supplier || '',
            expiryDate: item.expiryDate || '',
            lastRestockDate: item.lastRestockDate || ''
        });
        setEditingId(item.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            setError('');
            await axios.delete(
                `http://localhost:8080/api/inventory/${id}`,
                { headers: getHeaders() }
            );
            setSuccessMessage('Item deleted successfully!');
            loadItems();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting item:', err);
            setError('Failed to delete item');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const resetForm = () => {
        let initialItemName = '';
        if (type === 'FUEL') {
            initialItemName = 'Petrol';
        }
        setForm({
            itemName: initialItemName,
            quantity: '',
            thresholdValue: '',
            unitPrice: '',
            category: '',
            supplier: '',
            expiryDate: '',
            lastRestockDate: ''
        });
        setFormErrors({});
        setEditingId(null);
        setShowForm(false);
    };

    const getTypeName = () => {
        const names = {
            'FOOD': 'Food & Beverage',
            'SPARE_PART': 'Spare Parts',
            'FUEL': 'Fuel Management'
        };
        return names[type] || type;
    };

    return (
        <div className="manage-inventory-container">
            <div className="inventory-header">
                <div className="header-text">
                    <h1>{getTypeName()} Inventory</h1>
                </div>
                <div className="header-actions">
                    {userRole === 'PARKING_OWNER' && (
                        <button className="add-item-btn" onClick={() => setShowForm(true)}>
                            <span className="material-symbols-outlined">add_circle</span>
                            Add New Item
                        </button>
                    )}
                </div>
            </div>

            {successMessage && (
                <div className="alert-success">
                    <span>✓ {successMessage}</span>
                    <button onClick={() => setSuccessMessage('')}>×</button>
                </div>
            )}

            {error && (
                <div className="alert-error">
                    <span>✕ {error}</span>
                    <button onClick={() => setError('')}>×</button>
                </div>
            )}

            {items.some(i => i.quantity <= i.thresholdValue) && (
                <div className="alert-warning">
                    <span>⚠️ Warning: Some items are in low stock!</span>
                </div>
            )}

            {showForm && (
                <div className="form-modal">
                    <div className="form-modal-content">
                        <div className="form-header">
                            <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
                            <button className="close-btn" onClick={resetForm}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="inventory-form">
                            <div className="form-group">
                                <label htmlFor="itemName">
                                    {type === 'SPARE_PART' ? 'Part Name *' : type === 'FUEL' ? 'Fuel Type *' : 'Item Name *'}
                                </label>
                                {type === 'FUEL' ? (
                                    <select
                                        id="itemName"
                                        name="itemName"
                                        value={form.itemName}
                                        onChange={handleInputChange}
                                        className={formErrors.itemName ? 'input-error' : ''}
                                    >
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                    </select>
                                ) : (
                                    <input
                                        id="itemName"
                                        type="text"
                                        name="itemName"
                                        value={form.itemName}
                                        onChange={handleInputChange}
                                        placeholder={`Enter ${type === 'SPARE_PART' ? 'part' : 'item'} name`}
                                        className={formErrors.itemName ? 'input-error' : ''}
                                    />
                                )}
                                {formErrors.itemName && <span className="error-text">{formErrors.itemName}</span>}
                            </div>

                            {type === 'SPARE_PART' && (
                                <div className="form-group">
                                    <label htmlFor="category">Vehicle Type (Category) *</label>
                                    <input
                                        id="category"
                                        type="text"
                                        name="category"
                                        value={form.category}
                                        onChange={handleInputChange}
                                        placeholder="e.g., SUV, Sedan"
                                        className={formErrors.category ? 'input-error' : ''}
                                    />
                                    {formErrors.category && <span className="error-text">{formErrors.category}</span>}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="quantity">{type === 'FUEL' ? 'Liters (Quantity) *' : 'Quantity *'}</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    step="0.01"
                                    className={formErrors.quantity ? 'input-error' : ''}
                                />
                                {formErrors.quantity && <span className="error-text">{formErrors.quantity}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="unitPrice">Unit Price (Rs.) *</label>
                                <input
                                    id="unitPrice"
                                    type="number"
                                    name="unitPrice"
                                    value={form.unitPrice}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    className={formErrors.unitPrice ? 'input-error' : ''}
                                />
                                {formErrors.unitPrice && <span className="error-text">{formErrors.unitPrice}</span>}
                            </div>

                            {type === 'FOOD' && (
                                <div className="form-group">
                                    <label htmlFor="expiryDate">Expiry Date *</label>
                                    <input
                                        id="expiryDate"
                                        type="date"
                                        name="expiryDate"
                                        value={form.expiryDate}
                                        onChange={handleInputChange}
                                        className={formErrors.expiryDate ? 'input-error' : ''}
                                    />
                                    {formErrors.expiryDate && <span className="error-text">{formErrors.expiryDate}</span>}
                                </div>
                            )}

                            {(type === 'SPARE_PART' || type === 'FUEL') && (
                                <div className="form-group">
                                    <label htmlFor="supplier">Supplier *</label>
                                    <input
                                        id="supplier"
                                        type="text"
                                        name="supplier"
                                        value={form.supplier}
                                        onChange={handleInputChange}
                                        placeholder="Enter supplier name"
                                        className={formErrors.supplier ? 'input-error' : ''}
                                    />
                                    {formErrors.supplier && <span className="error-text">{formErrors.supplier}</span>}
                                </div>
                            )}

                            {type === 'FUEL' && (
                                <div className="form-group">
                                    <label htmlFor="lastRestockDate">Last Restock Date *</label>
                                    <input
                                        id="lastRestockDate"
                                        type="date"
                                        name="lastRestockDate"
                                        value={form.lastRestockDate}
                                        onChange={handleInputChange}
                                        className={formErrors.lastRestockDate ? 'input-error' : ''}
                                    />
                                    {formErrors.lastRestockDate && <span className="error-text">{formErrors.lastRestockDate}</span>}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="thresholdValue">Low Stock Threshold *</label>
                                <input
                                    id="thresholdValue"
                                    type="number"
                                    name="thresholdValue"
                                    value={form.thresholdValue}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    step="0.01"
                                    className={formErrors.thresholdValue ? 'input-error' : ''}
                                />
                                {formErrors.thresholdValue && <span className="error-text">{formErrors.thresholdValue}</span>}
                                <small>Alert will show when quantity falls below this value</small>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingId ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading items...</p>
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className="table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Unit Price (Rs.)</th>
                                <th>Expiry Date / Info</th>
                                {userRole !== 'DRIVER' && <th>Threshold</th>}
                                <th>Status</th>
                                {userRole !== 'DRIVER' && <th style={{ textAlign: 'center' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => {
                                const isLowStock = item.quantity <= item.thresholdValue;
                                return (
                                    <tr
                                        key={item.id}
                                        className={isLowStock ? 'low-stock-row' : ''}
                                    >
                                        <td className="item-name">{item.itemName}</td>
                                        <td>{item.quantity}</td>
                                        <td>Rs. {parseFloat(item.unitPrice).toFixed(2)}</td>
                                        <td>
                                            {type === 'FOOD' ? item.expiryDate :
                                                type === 'SPARE_PART' ? item.category :
                                                    item.lastRestockDate || 'N/A'}
                                        </td>
                                        {userRole !== 'DRIVER' && <td>{item.thresholdValue}</td>}
                                        <td>
                                            {isLowStock ? (
                                                <span className="status-badge low-stock">
                                                    <span className="dot"></span> Low Stock
                                                </span>
                                            ) : (
                                                <span className="status-badge normal">
                                                    <span className="check">✓</span> Normal
                                                </span>
                                            )}
                                        </td>
                                        {userRole !== 'DRIVER' && (
                                            <td className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(item)}
                                                    title="Edit"
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>{userRole === 'DRIVER' ? 'No items available' : 'No items yet'}</h3>
                    <p>
                        {userRole === 'DRIVER'
                            ? 'This parking place currently has no items in this category.'
                            : `Start by adding your first ${getTypeName().toLowerCase()} item`}
                    </p>
                    {userRole !== 'DRIVER' && (
                        <button className="add-item-btn" onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}>
                            + Add First Item
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageInventory;