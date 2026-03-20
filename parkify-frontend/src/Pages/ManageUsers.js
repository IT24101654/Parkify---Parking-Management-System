import React from 'react';
import './ManageUser.css';

function ManageUser() {
    return (
        <div className="user-card">
            <h2>Super Admin Management</h2>
            <p>Only Super Admin is active in the system.</p>
            <table className="user-table">
                <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Super Admin</td>
                        <td>admin@parkify.ai</td>
                        <td><span className="badge-admin">Super Admin</span></td>
                        <td style={{color:'#22c55e'}}>Active</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
export default ManageUser;