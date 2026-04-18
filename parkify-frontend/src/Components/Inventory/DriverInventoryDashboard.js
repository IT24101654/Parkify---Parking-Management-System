import React, { useState } from 'react';
import DriverInventoryList from './DriverInventoryList';
import './Inventory.css';

const DriverInventoryDashboard = () => {
    const [selectedType, setSelectedType] = useState(null);

    const sections = [
        { name: 'Food & Beverage', path: 'FOOD', icon: 'restaurant', desc: 'Browse available food and beverage items' },
        { name: 'Spare Parts', path: 'SPARE_PART', icon: 'settings', desc: 'View available vehicle spare parts' },
        { name: 'Fuel Management', path: 'FUEL', icon: 'local_gas_station', desc: 'Check available fuel inventory' }
    ];

    if (selectedType) {
        return (
            <div className="inventory-wrapper">
                <button
                    className="back-to-sections-btn"
                    onClick={() => setSelectedType(null)}
                >
                    ← Back to Categories
                </button>
                <DriverInventoryList selectedType={selectedType} />
            </div>
        );
    }

    return (
        <div className="inventory-main">
            <h1 className="main-title">Inventory Options</h1>
            <p className="main-subtitle">Select a category to view available items</p>
            <div className="card-grid">
                {sections.map((sec, idx) => (
                    <div
                        key={idx}
                        className="inv-card"
                        onClick={() => setSelectedType(sec.path)}
                    >
                        <span className="material-symbols-outlined">{sec.icon}</span>
                        <h3>{sec.name}</h3>
                        <p>{sec.desc}</p>
                        <div className="card-arrow">→</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriverInventoryDashboard;
