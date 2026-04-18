import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageUser.css';

function ManageUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Authorization header missing. Please login again.");
                    setLoading(false);
                    return;
                }
                const response = await axios.get('/api/users/admin/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again later.");
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const openModal = (user) => {
        setSelectedUser(user);
    };

    const closeModal = () => {
        setSelectedUser(null);
    };

    if (loading) return <div className="loading-users">Loading users...</div>;
    if (error) return <div className="error-users">{error}</div>;

    return (
        <div className="manage-users-container">
            <div className="user-card-main">
                <div className="um-header">
                    <h2>Registered Users</h2>
                    <p>Click on any user row to view full profile details.</p>
                </div>
                
                <div className="table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} onClick={() => openModal(user)} className="user-row">
                                    <td>
                                        <div className="user-name-cell">
                                            <img 
                                                src={user.profilePicture ? `http://localhost:8080/api/users/profile-image/${user.profilePicture}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                                                alt="profile" 
                                                className="table-avatar"
                                            />
                                            <span>{user.name}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phoneNumber || 'N/A'}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={user.active ? "status-active" : "status-inactive"}>
                                            {user.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="no-users">No users found in the system.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <div className="um-modal-overlay" onClick={closeModal}>
                    <div className="um-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="um-close-btn" onClick={closeModal}>&times;</button>
                        
                        <div className="um-modal-header">
                            <div className="um-modal-avatar-wrapper">
                                <img 
                                    src={selectedUser.profilePicture ? `http://localhost:8080/api/users/profile-image/${selectedUser.profilePicture}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`} 
                                    alt="Profile" 
                                    className="um-modal-avatar"
                                />
                            </div>
                        </div>

                        <div className="um-modal-body">
                            <h3 className="um-modal-name">{selectedUser.name}</h3>
                            <p className="um-modal-role">{selectedUser.role.replace('_', ' ')}</p>

                            <div className="um-modal-details-grid">
                                <div className="um-detail-item">
                                    <span className="material-symbols-outlined">mail</span>
                                    <div className="um-detail-text">
                                        <label>Email</label>
                                        <p>{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="um-detail-item">
                                    <span className="material-symbols-outlined">call</span>
                                    <div className="um-detail-text">
                                        <label>Phone</label>
                                        <p>{selectedUser.phoneNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                                
                                {selectedUser.role === 'PARKING_OWNER' && (
                                    <div className="um-detail-item full-width">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <div className="um-detail-text">
                                            <label>Location</label>
                                            <p>{selectedUser.address || 'Location not provided'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedUser.role === 'DRIVER' && (
                                <div className="um-driver-vehicles">
                                    <h4>Registered Vehicles</h4>
                                    {selectedUser.vehicles && selectedUser.vehicles.length > 0 ? (
                                        <div className="um-vehicles-list">
                                            {selectedUser.vehicles.map(v => (
                                                <div key={v.id} className="um-vehicle-badge">
                                                    <span className="material-symbols-outlined">directions_car</span>
                                                    <span>{v.vehicleNumber} ({v.model})</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-vehicles">No vehicles registered yet.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUser;