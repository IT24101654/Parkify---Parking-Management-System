import React, { useState } from 'react';
import './InitializeServiceCenterModal.css';

const InitializeServiceCenterModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contactNumber: '',
        workingHours: '',
        address: '',
        type: 'General Repair',
        notes: '',
        servicesSummary: ''
    });

    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Service Center Name is required';
        if (!formData.contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        } else if (!/^\d{10}$/.test(formData.contactNumber)) {
            newErrors.contactNumber = 'Phone number must be exactly 10 digits';
        }
        if (!formData.address.trim()) newErrors.address = 'Location address is required';
        if (!formData.workingHours.trim()) newErrors.workingHours = 'Working hours are required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="sc-modal-overlay">
            <div className="sc-modal">
                <div className="sc-modal-header">
                    <div className="sc-header-content">
                        <div className="sc-icon-box">
                            <span className="material-symbols-outlined">handyman</span>
                        </div>
                        <div>
                            <h3>Initialize Service Center</h3>
                            <p>Bring your professional services to Parkify users</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form className="sc-modal-body" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h4 className="section-label">General Information</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Service Center Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Max Auto Care"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={errors.name ? 'error' : ''}
                                />
                                {errors.name && <span className="error-msg">{errors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label>Center Type</label>
                                <select name="type" value={formData.type} onChange={handleChange}>
                                    <option value="General Repair">General Repair</option>
                                    <option value="Specialized">Specialized</option>
                                    <option value="Car Wash & Detail">Car Wash & Detail</option>
                                    <option value="Hybrid Specialist">Hybrid Specialist</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                rows="2"
                                placeholder="Briefly describe your expertise..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h4 className="section-label">Contact & Logistics</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Number *</label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    placeholder="07XXXXXXXX"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    className={errors.contactNumber ? 'error' : ''}
                                />
                                {errors.contactNumber && <span className="error-msg">{errors.contactNumber}</span>}
                            </div>
                            <div className="form-group">
                                <label>Working Hours *</label>
                                <input
                                    type="text"
                                    name="workingHours"
                                    placeholder="e.g. 8:00 AM - 6:00 PM"
                                    value={formData.workingHours}
                                    onChange={handleChange}
                                    className={errors.workingHours ? 'error' : ''}
                                />
                                {errors.workingHours && <span className="error-msg">{errors.workingHours}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Location / Address *</label>
                            <input
                                type="text"
                                name="address"
                                placeholder="Full street address..."
                                value={formData.address}
                                onChange={handleChange}
                                className={errors.address ? 'error' : ''}
                            />
                            {errors.address && <span className="error-msg">{errors.address}</span>}
                        </div>
                    </div>

                    <div className="form-section">
                        <h4 className="section-label">Services & Notes</h4>
                        <div className="form-group">
                            <label>Available Services Summary</label>
                            <input
                                type="text"
                                name="servicesSummary"
                                placeholder="e.g. Oil Change, Wheel Balancing, Full Service"
                                value={formData.servicesSummary}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Additional Notes</label>
                            <textarea
                                name="notes"
                                rows="2"
                                placeholder="Special instructions for customers..."
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="sc-modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save">
                            <span className="material-symbols-outlined">add_circle</span>
                            Add Service Center
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InitializeServiceCenterModal;
