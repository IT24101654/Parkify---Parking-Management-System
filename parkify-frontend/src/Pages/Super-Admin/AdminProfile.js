import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminProfile.css';

function AdminProfile({ adminData, setAdminData }) {
    const [tempData, setTempData] = useState({
        name: '',
        address: '',
        phone: ''
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const API_BASE_URL = 'http://localhost:8080/api/users';
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (adminData) {
            setTempData({
                name: adminData.name || '',
                address: adminData.address || '',
                phone: adminData.phoneNumber || adminData.phone || ''
            });
        }
    }, [adminData]);

    const handleUpdate = async () => {
        const userId = adminData?.id || localStorage.getItem('userId');

        if (!userId) {
            alert("Error: User ID is missing! Please re-login.");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const profileResponse = await axios.put(`${API_BASE_URL}/${userId}/profile`, {
                name: tempData.name,
                phoneNumber: tempData.phone,
                address: tempData.address
            }, config);

            let updatedUser = profileResponse.data;

            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                const imgResponse = await axios.post(`${API_BASE_URL}/${userId}/upload-profile-image`, formData, {
                    headers: config.headers
                });
                updatedUser.profilePicture = imgResponse.data.fileName;
            }

            setAdminData(updatedUser);
            setIsEditMode(false);
            setPreviewUrl(null);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Update failed:", error);
            let msg = "Unknown error";
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    msg = error.response.data;
                } else if (error.response.data.message) {
                    msg = error.response.data.message;
                } else if (error.response.data.error) {
                    msg = error.response.data.error;
                } else {
                    msg = JSON.stringify(error.response.data);
                }
            } else {
                msg = error.message;
            }
            alert("Update failed! " + msg);
        }
    };

    const handleCancel = () => {
        setTempData({
            name: adminData?.name || '',
            address: adminData?.address || '',
            phone: adminData?.phoneNumber || adminData?.phone || ''
        });
        setPreviewUrl(null);
        setSelectedFile(null);
        setIsEditMode(false);
    };

    return (
        <div className="prof-card glass-card">
            <h2>Admin Profile (ID: {adminData?.id || 'N/A'})</h2>
            <div className="prof-grid">
                <div className="prof-left">
                    <div className="avatar-wrapper">
                        <img
                            src={previewUrl || (adminData?.profilePicture ? `http://localhost:8080/api/users/profile-image/${adminData.profilePicture}` : 'https://ui-avatars.com/api/?name=Admin')}
                            className="profile-avatar" alt="profile"
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    {isEditMode && (
                        <div className="file-input-wrapper" style={{ marginTop: '10px' }}>
                            <input type="file" accept="image/*" onChange={(e) => {
                                if (e.target.files[0]) {
                                    const file = e.target.files[0];
                                    if (file.size > 5 * 1024 * 1024) {
                                        alert('Image exceeds 5MB limit. Please choose a smaller file.');
                                        e.target.value = null;
                                        return;
                                    }
                                    setSelectedFile(file);
                                    setPreviewUrl(URL.createObjectURL(file));
                                }
                            }} />
                        </div>
                    )}
                </div>
                <div className="prof-right">
                    <div className="input-group">
                        <label>Display Name</label>
                        <input type="text" disabled={!isEditMode} value={tempData.name} onChange={e => setTempData({ ...tempData, name: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" disabled={true} value={adminData?.email || ''} />
                        <small className="note">Email arrives from account and cannot be changed here.</small>
                    </div>
                    <div className="input-group">
                        <label>Address</label>
                        <input type="text" disabled={!isEditMode} value={tempData.address} onChange={e => setTempData({ ...tempData, address: e.target.value })} />
                    </div>
                    <div className="input-group">
                        <label>Phone Number</label>
                        <input type="text" disabled={!isEditMode} value={tempData.phone} onChange={e => setTempData({ ...tempData, phone: e.target.value })} />
                    </div>

                    <div className="actions" style={{ marginTop: '20px' }}>
                        <button className="save-btn" onClick={() => isEditMode ? handleUpdate() : setIsEditMode(true)}>
                            {isEditMode ? "Save to Database" : "Edit Profile"}
                        </button>
                        {isEditMode && <button className="cancel-btn" onClick={handleCancel} style={{ marginLeft: '10px' }}>Cancel</button>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;