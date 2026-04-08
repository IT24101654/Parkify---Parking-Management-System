import React from 'react';
import './ParkingDetailsCard.css';
import parkingBg from '../../Assets/parking-bg.jpg';

const ParkingDetailsCard = ({
    selectedPlace, onToggleFavorite, isFavorite, onClose, nearbyIds, getDistLabel,
    onViewInventory, onViewServices
}) => {


    if (!selectedPlace) return null;

    const handleBookNow = () => {
        const pkg = {
            id: selectedPlace.id,
            name: selectedPlace.parkingName,
            price: selectedPlace.price
        };
        localStorage.setItem('pendingReservation', JSON.stringify(pkg));
        window.location.href = '/reservation';
    };

    return (
        <div className={`pdc-card-side-panel ${selectedPlace ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button className="pdc-close-card" onClick={onClose}>
                <span className="material-symbols-outlined">close</span>
            </button>

            {/* Header Image & Badges */}
            <div className="pdc-card-header">
                <img
                    src={
                        selectedPlace.placeImage && selectedPlace.placeImage !== 'null' && selectedPlace.placeImage !== ''
                            ? `http://localhost:8080/api/parking/image/${selectedPlace.placeImage}`
                            : parkingBg
                    }
                    alt="Parking"
                    onError={(e) => { e.target.onerror = null; e.target.src = parkingBg; }}
                />
                <div className="pdc-header-fade" />

                {/* Favorite Button */}
                <button
                    className={`pdc-fav-btn ${isFavorite ? 'active' : ''}`}
                    onClick={() => onToggleFavorite(selectedPlace.id)}
                >
                    <span className="material-symbols-outlined">
                        {isFavorite ? 'favorite' : 'favorite_border'}
                    </span>
                </button>

                {/* Nearby Badge */}
                {nearbyIds && nearbyIds.has(selectedPlace.id) && (
                    <div className="pdc-nearby-badge">
                        <span className="material-symbols-outlined">near_me</span>
                        Nearby
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="pdc-card-content">
                <div className="title-row">
                    <h3>{selectedPlace.parkingName}</h3>
                    <div className={`pdc-status-chip ${selectedPlace.status === 'ACTIVE' || !selectedPlace.status ? 'pdc-chip-green' : 'pdc-chip-red'}`}>
                        {selectedPlace.status || 'ACTIVE'}
                    </div>
                </div>
                <p className="pdc-subtitle">{selectedPlace.type || 'Standard'} Parking</p>

                {/* Grid of details */}
                <div className="pdc-details-grid">
                    <div className="pdc-detail-item">
                        <span className="material-symbols-outlined">location_on</span>
                        <div>
                            <p className="pdc-label">Location ({getDistLabel ? getDistLabel(selectedPlace) : 'Calculating...'})</p>
                            <p className="pdc-val">{selectedPlace.location}</p>
                        </div>
                    </div>
                    <div className="pdc-detail-item">
                        <span className="material-symbols-outlined">schedule</span>
                        <div>
                            <p className="pdc-label">Hours</p>
                            <p className="pdc-val">{selectedPlace.is24Hours ? 'Open 24/7' : `${selectedPlace.openHours} - ${selectedPlace.closeHours}`}</p>
                        </div>
                    </div>
                    <div className="pdc-detail-item">
                        <span className="material-symbols-outlined">payments</span>
                        <div>
                            <p className="pdc-label">Pricing (Rs.)</p>
                            <p className="pdc-val">Hr: {selectedPlace.price} | Day: {selectedPlace.dailyPrice || '-'}</p>
                        </div>
                    </div>
                    <div className="pdc-detail-item">
                        <span className="material-symbols-outlined">garage</span>
                        <div>
                            <p className="pdc-label">Capacity</p>
                            <p className="pdc-val">{selectedPlace.slots} Slots</p>
                        </div>
                    </div>
                </div>

                {selectedPlace.description && (
                    <div className="pdc-description-card">
                        <span className="material-symbols-outlined">info</span>
                        <p>{selectedPlace.description}</p>
                    </div>
                )}

                {/* Navigation Actions for Owner Features */}
                <div className="pdc-feature-actions">
                    {(selectedPlace.hasInventory === true || selectedPlace.hasInventory === "true") && (
                        <button className="pdc-secondary-action-btn" onClick={onViewInventory}>
                            <span className="material-symbols-outlined">inventory</span>
                            View Inventory
                        </button>
                    )}
                    {(selectedPlace.hasServiceCenter === true || selectedPlace.hasServiceCenter === "true") && (
                        <button className="pdc-secondary-action-btn" onClick={onViewServices}>
                            <span className="material-symbols-outlined">build</span>
                            View Services
                        </button>
                    )}
                </div>

                {/* Action buttons */}
                <div className="pdc-action-row">
                    <button className="pdc-book-now-btn" onClick={handleBookNow}>
                        <span className="material-symbols-outlined">book_online</span>
                        BOOK NOW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParkingDetailsCard;
