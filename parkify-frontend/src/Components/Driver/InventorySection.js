import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventorySection.css';

const InventorySection = ({ parkingPlaceId }) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/api/inventory/by-parking-place/${parkingPlaceId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInventory(response.data || []);
            } catch (error) {
                console.error('Failed to fetch inventory:', error);
            } finally {
                setLoading(false);
            }
        };

        if (parkingPlaceId) {
            fetchInventory();
        }
    }, [parkingPlaceId]);

    if (loading) return <div className="is-loading">Loading inventory...</div>;
    if (inventory.length === 0) return null;

    return (
        <div className="inventory-section-wrapper">
            <h4 className="section-title">
                <span className="material-symbols-outlined">inventory_2</span>
                Available Accessories
            </h4>
            <div className="inventory-items-grid">
                {inventory.map((item) => (
                    <div key={item.id} className="inventory-item-card">
                        <div className="item-info">
                            <p className="item-name">{item.itemName}</p>
                            <p className="item-category">{item.category}</p>
                        </div>
                        <p className="item-price">Rs. {item.unitPrice}</p>
                    </div>
                ))}
            </div>
            {inventory.length > 3 && (
                <button className="view-all-btn">View All Items</button>
            )}
        </div>
    );
};

export default InventorySection;
