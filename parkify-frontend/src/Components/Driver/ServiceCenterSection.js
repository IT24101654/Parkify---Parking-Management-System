import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServiceCenterSection.css';

const ServiceCenterSection = ({ userId }) => {
    const [serviceCenter, setServiceCenter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServiceCenter = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/api/service-centers/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Check if the response was successful but empty
                if (response.status === 204 || !response.data) {
                    setServiceCenter(null);
                } else {
                    setServiceCenter(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch service center:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchServiceCenter();
        }
    }, [userId]);

    if (loading) return <div className="sc-loading">Checking for services...</div>;
    if (!serviceCenter) return null;

    return (
        <div className="service-center-section-wrapper">
            <h4 className="section-title">
                <span className="material-symbols-outlined">build</span>
                Service Center
            </h4>
            <div className="service-center-card">
                <div className="sc-header">
                    <p className="sc-name">{serviceCenter.name}</p>
                    <div className="sc-status">
                        <span className="dot"></span>
                        {serviceCenter.active ? 'Open Now' : 'Closed'}
                    </div>
                </div>
                <div className="sc-details">
                    <div className="sc-detail-row">
                        <span className="material-symbols-outlined">schedule</span>
                        <p>{serviceCenter.workingHours}</p>
                    </div>
                    <div className="sc-detail-row">
                        <span className="material-symbols-outlined">call</span>
                        <p>{serviceCenter.contactNumber}</p>
                    </div>
                </div>
                <button className="book-service-btn">Book Maintenance</button>
            </div>
        </div>
    );
};

export default ServiceCenterSection;
