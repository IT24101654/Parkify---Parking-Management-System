import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Inventory.css';

const DriverInventoryList = ({ selectedType }) => {
    const { type: urlType } = useParams();
    const type = selectedType || urlType || window.location.pathname.split('/').pop();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            const response = await axios.get(
                `http://localhost:8080/api/inventory/driver/type/${type}`,
                { headers: getHeaders() }
            );
            setItems(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error loading items:', err);
            setError('Failed to load items. Please check your connection.');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        if (type) {
            loadItems();
        }
    }, [type, loadItems]);

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
            <div className="manage-header">
                <h1>{getTypeName()} Inventory</h1>
            </div>

            {error && (
                <div className="alert-error">
                    <span>✕ {error}</span>
                    <button onClick={() => setError('')}>×</button>
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
                                <th>{type === 'SPARE_PART' ? 'Part Name' : type === 'FUEL' ? 'Fuel Type' : 'Item Name'}</th>
                                {type === 'SPARE_PART' && <th>Vehicle Type</th>}
                                <th>{type === 'FUEL' ? 'Liters' : 'Quantity'}</th>
                                <th>Unit Price (Rs.)</th>
                                {type === 'FOOD' && <th>Expiry Date</th>}
                                {(type === 'SPARE_PART' || type === 'FUEL') && <th>Supplier</th>}
                                {type === 'FUEL' && <th>Last Restock Date</th>}
                                <th>Status</th>
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
                                        {type === 'SPARE_PART' && <td>{item.category}</td>}
                                        <td>{item.quantity}</td>
                                        <td>Rs. {parseFloat(item.unitPrice).toFixed(2)}</td>
                                        {type === 'FOOD' && <td>{item.expiryDate}</td>}
                                        {(type === 'SPARE_PART' || type === 'FUEL') && <td>{item.supplier}</td>}
                                        {type === 'FUEL' && <td>{item.lastRestockDate}</td>}
                                        <td>
                                            {isLowStock ? (
                                                <span className="alert-badge">🔴 Low Stock</span>
                                            ) : (
                                                <span className="normal-badge">✓ Normal</span>
                                            )}
                                        </td>
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
                    <h3>No items available</h3>
                    <p>There are no {getTypeName().toLowerCase()} items added by the parking owner yet.</p>
                </div>
            )}
        </div>
    );
};

export default DriverInventoryList;
