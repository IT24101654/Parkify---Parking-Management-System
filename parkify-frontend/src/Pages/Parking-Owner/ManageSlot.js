import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes, faCogs, faMagic, faChartPie, faPlus, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import './ManageSlot.css';

const ManageSlot = ({ place, isOpen, onClose }) => {
    const [slotsList, setSlotsList] = useState([]);
    const [bulkSlotData, setBulkSlotData] = useState({
        prefix: 'P-',
        count: 10,
        type: 'Car'
    });
    const [expandedGroups, setExpandedGroups] = useState({});
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

    const showMessage = (text, type = 'success') => {
        setStatusMsg({ text, type });
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
    };

    const loadSlots = useCallback(async () => {
        if (!place) return;
        try {
            const token = localStorage.getItem('token');
            const cfg = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`/api/slots/place/${place.id}`, cfg);
            setSlotsList(res.data);
        } catch (error) {
            console.error("Error loading slots", error);
        }
    }, [place]);

    useEffect(() => {
        if (isOpen && place) {
            loadSlots();
        }
    }, [isOpen, place, loadSlots]);

    const handleBulkCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const cfg = { headers: { Authorization: `Bearer ${token}` } };
            const payload = { ...bulkSlotData, placeId: place.id };
            await axios.post('/api/slots/bulk-create', payload, cfg);
            loadSlots();
            setBulkSlotData({ prefix: 'P-', count: 10, type: 'Car' });
            showMessage(`Generated ${bulkSlotData.count} slots successfully!`);
        } catch (error) {
            console.error("Error bulk creating slots", error);
            showMessage("Failed to generate slots.", "error");
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        try {
            const token = localStorage.getItem('token');
            const cfg = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/slots/delete/${slotId}`, cfg);
            loadSlots();
            showMessage("Slot deleted successfully!");
        } catch (error) {
            console.error("Error deleting slot", error);
            showMessage("Failed to delete slot.", "error");
        }
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const getGroupedSlots = () => {
        if (!slotsList || slotsList.length === 0) return [];
        const groups = {};

        slotsList.forEach(slot => {
            const match = slot.slotName.match(/^([a-zA-Z\-_]*)(\d+)$/);
            const prefix = match ? match[1] : 'Individual';
            const num = match ? parseInt(match[2], 10) : null;

            const groupKey = `${prefix}_${slot.slotType}_${slot.floor || 'None'}_${slot.slotStatus}`;

            if (!groups[groupKey]) {
                groups[groupKey] = {
                    id: groupKey,
                    prefix: prefix,
                    type: slot.slotType,
                    floor: slot.floor,
                    status: slot.slotStatus,
                    slots: [],
                    isSequential: !!match
                };
            }
            groups[groupKey].slots.push({ ...slot, num });
        });

        return Object.values(groups).map(group => {
            if (group.isSequential && group.slots.length > 1) {
                group.slots.sort((a, b) => a.num - b.num);
                const first = group.slots[0].slotName;
                const last = group.slots[group.slots.length - 1].slotName;
                group.summaryName = `${first} – ${last}`;
            } else if (group.slots.length > 1) {
                group.summaryName = `${group.prefix} (Group of ${group.slots.length})`;
            } else {
                group.summaryName = group.slots[0].slotName;
            }
            return group;
        });
    };

    if (!isOpen || !place) return null;

    return (
        <div className="pm-modal-overlay">
            <div className="pm-modal-content slot-manager-modal animate-fade-in">
                <button className="premium-close-btn" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className="modal-header-premium">
                    <h2><FontAwesomeIcon icon={faCogs} /> Manage Slots: {place.parkingName}</h2>
                    <p>Configure specific parking spots and inventory.</p>
                </div>

                {statusMsg.text && (
                    <div className={`status-banner ${statusMsg.type}`}>
                        {statusMsg.text}
                    </div>
                )}

                <div className="pm-slot-manager-container">
                    <div className="pm-slot-creators-row">
                        <div className="pm-bulk-creator-section info-card">
                            <h3><FontAwesomeIcon icon={faMagic} /> Bulk Generate</h3>
                            <div className="pm-bulk-creator">
                                <div className="pm-field">
                                    <label>ID Prefix</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SPOT-"
                                        value={bulkSlotData.prefix}
                                        onChange={(e) => setBulkSlotData({ ...bulkSlotData, prefix: e.target.value })}
                                    />
                                </div>
                                <div className="pm-field">
                                    <label>Slot Count</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 10"
                                        value={bulkSlotData.count}
                                        onChange={(e) => setBulkSlotData({ ...bulkSlotData, count: e.target.value })}
                                    />
                                </div>
                                <div className="pm-field">
                                    <label>Vehicle Type</label>
                                    <select
                                        value={bulkSlotData.type}
                                        onChange={(e) => setBulkSlotData({ ...bulkSlotData, type: e.target.value })}
                                    >
                                        <option value="Car">Car</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Van">Van</option>
                                        <option value="EV">EV Station</option>
                                    </select>
                                </div>
                                <button onClick={handleBulkCreate} className="pm-primary-btn">Generate Slots</button>
                            </div>
                        </div>
                    </div>

                    <div className="pm-slots-list-section">
                        <h3><FontAwesomeIcon icon={faChartPie} /> Existing Slots Summary</h3>
                        <div className="pm-summary-container">
                            {getGroupedSlots().map(group => (
                                <div key={group.id} className={`pm-slot-group-card ${expandedGroups[group.id] ? 'expanded' : ''}`}>
                                    <div className="group-header" onClick={() => toggleGroup(group.id)}>
                                        <div className="group-main-info">
                                            <span className="group-name">{group.summaryName}</span>
                                            <span className="group-meta">
                                                <span className="meta-tag type">{group.type}</span>
                                                {group.floor && <span className="meta-tag floor">Floor {group.floor}</span>}
                                                <span className="meta-tag count">{group.slots.length} Slots</span>
                                            </span>
                                        </div>
                                        <div className="group-right-info">
                                            <span className={`status-pill ${group.status.toLowerCase()}`}>{group.status}</span>
                                            <FontAwesomeIcon icon={faPlus} className="expand-icon" />
                                        </div>
                                    </div>

                                    {expandedGroups[group.id] && (
                                        <div className="group-details animate-fade-in">
                                            <div className="details-grid">
                                                {group.slots.map(slot => (
                                                    <div key={slot.id} className="mini-slot-card">
                                                        <span>{slot.slotName}</span>
                                                        <button
                                                            className="mini-del-btn"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id); }}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {slotsList.length === 0 && (
                                <div className="no-slots-placeholder">
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    <p>No slots configured yet. Use the tools above to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSlot;
