import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import './Login.css';

axios.defaults.timeout = 15000;

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetStep, setResetStep] = useState(1);

    const [showRoleSelect, setShowRoleSelect] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');

    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setLoginError('Email and password are required.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', {
                email: email.trim().toLowerCase(),
                password: password
            });

            const { status, roles } = response.data;

            if (status === 'OTP_SENT') {

                setSelectedRole(roles[0]);
                setLoginError('');
                setShowOTP(true);
            } else if (status === 'ROLE_SELECTION_REQUIRED') {

                setAvailableRoles(roles);
                setLoginError('');
                setShowRoleSelect(true);
            }
        } catch (error) {
            const err = error.response?.data?.error || error.message || 'Network Error';
            setLoginError(err);
            console.error('Login request failed:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleRoleSelection = async (role) => {
        setSelectedRole(role);
        setLoading(true);
        try {
            await axios.post('/api/auth/select-role', {
                email: email.trim().toLowerCase(),
                role: role
            });
            setShowRoleSelect(false);
            setShowOTP(true);
        } catch (error) {
            const err = error.response?.data?.error || error.message || 'Failed to send OTP';
            setLoginError(err);
            setShowRoleSelect(false);
        } finally {
            setLoading(false);
        }
    };


    const verifyOTP = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-otp', {
                email: email.trim().toLowerCase(),
                otp: otp,
                role: selectedRole
            });

            const { token, role, id } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role.toUpperCase());
            localStorage.setItem('userId', id);

            switch (role.toUpperCase()) {
                case 'SUPER_ADMIN':
                    navigate('/admin-dashboard');
                    break;
                case 'PARKING_OWNER':
                    navigate('/po-dashboard');
                    break;
                case 'DRIVER':
                    navigate('/driver-dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            console.error('OTP Verification Error:', error);
            alert(error.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const requestPasswordReset = async () => {
        setLoading(true);
        try {
            await axios.post('/api/users/forgot-password', {
                email: forgotEmail.trim().toLowerCase()
            });
            setResetMessage('OTP sent to your email.');
            setResetStep(2);
        } catch (error) {
            const err = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send reset OTP';
            setResetMessage(err);
        } finally {
            setLoading(false);
        }
    };

    const performPasswordReset = async () => {
        setLoading(true);
        try {
            await axios.post('/api/users/reset-password', {
                email: forgotEmail.trim().toLowerCase(),
                otp: forgotOtp,
                newPassword: newPassword
            });
            alert('Password reset successfully!');
            setShowForgotPassword(false);
            setResetStep(1);
        } catch (error) {
            const err = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to reset password';
            setResetMessage(err);
        } finally {
            setLoading(false);
        }
    };


    const roleLabel = (role) => {
        switch (role) {
            case 'DRIVER': return 'Driver';
            case 'PARKING_OWNER': return 'Parking Owner';
            case 'SUPER_ADMIN': return 'Super Admin';
            default: return role;
        }
    };

    const roleIcon = (role) => {
        switch (role) {
            case 'DRIVER': return 'directions_car';
            case 'PARKING_OWNER': return 'real_estate_agent';
            case 'SUPER_ADMIN': return 'admin_panel_settings';
            default: return 'person';
        }
    };


    return (
        <div className="auth-page">
            <Navbar variant="login" />
            <div className="auth-split-container">
                <div className="auth-visual" style={{ background: 'linear-gradient(rgba(45,64,87,0.7),rgba(45,64,87,0.7)), url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000")' }}>
                    <div className="visual-text">
                        <h2>Smart Parking for Smart Cities.</h2>
                    </div>
                </div>

                <div className="auth-form-container">
                    { }
                    {!showOTP && !showForgotPassword && !showRoleSelect && (
                        <div className="auth-card-plain">
                            <h2 style={{ fontWeight: '800', color: '#2D4057' }}>Welcome Back</h2>
                            {loginError && <div style={{ color: '#d9534f', marginBottom: '12px', fontWeight: '600' }}>{loginError}</div>}
                            <form onSubmit={handleLoginSubmit}>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="name@company.com" required onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label>Password</label>
                                    <input type="password" placeholder="••••••••" required onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                <button type="submit" className="btn-auth-primary" disabled={loading}>
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <button className="btn-link" onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}>
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    )}

                    { }
                    {showRoleSelect && !showOTP && (
                        <div className="auth-card-plain">
                            <h2 style={{ fontWeight: '800', color: '#2D4057' }}>Choose Account</h2>
                            <p style={{ color: '#666', marginBottom: '20px' }}>
                                Your email is linked to multiple accounts. Select which one to log in as:
                            </p>
                            {loginError && <div style={{ color: '#d9534f', marginBottom: '12px', fontWeight: '600' }}>{loginError}</div>}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {availableRoles.map((role) => (
                                    <button
                                        key={role}
                                        className="btn-auth-primary"
                                        disabled={loading}
                                        onClick={() => handleRoleSelection(role)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                                            {roleIcon(role)}
                                        </span>
                                        {roleLabel(role)}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <button className="btn-link" onClick={() => { setShowRoleSelect(false); setLoginError(''); }}>
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    )}

                    {showOTP && (
                        <div className="auth-card-plain">
                            <h2 style={{ fontWeight: '800', color: '#2D4057' }}>Verify OTP</h2>
                            <p>Code sent to <strong>{email}</strong></p>
                            {selectedRole && (
                                <p style={{ color: '#2D4057', fontWeight: '600', marginBottom: '10px' }}>
                                    Logging in as: {roleLabel(selectedRole)}
                                </p>
                            )}
                            <input
                                type="text"
                                className="form-input-styled"
                                style={{ textAlign: 'center', fontSize: '1.5rem' }}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <button onClick={verifyOTP} className="btn-auth-primary" style={{ marginTop: '20px' }} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <button className="btn-link" onClick={() => { setShowOTP(false); setShowRoleSelect(false); }}>
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    )}

                    { }
                    {showForgotPassword && (
                        <div className="auth-card-plain">
                            <h2 style={{ fontWeight: '800', color: '#2D4057' }}>Reset Password</h2>
                            {resetMessage && <div style={{ color: '#d9534f', marginBottom: '12px', fontWeight: '600' }}>{resetMessage}</div>}
                            {resetStep === 1 ? (
                                <>
                                    <div className="input-group">
                                        <label>Email Address</label>
                                        <input type="email" value={forgotEmail} placeholder="Enter your email" required onChange={(e) => setForgotEmail(e.target.value)} />
                                    </div>
                                    <button onClick={requestPasswordReset} className="btn-auth-primary" disabled={loading}>Send Reset OTP</button>
                                </>
                            ) : (
                                <>
                                    <div className="input-group"><label>OTP</label><input type="text" onChange={(e) => setForgotOtp(e.target.value)} /></div>
                                    <div className="input-group"><label>New Password</label><input type="password" onChange={(e) => setNewPassword(e.target.value)} /></div>
                                    <button onClick={performPasswordReset} className="btn-auth-primary" disabled={loading}>Reset Password</button>
                                </>
                            )}
                            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                <button className="btn-link" onClick={() => setShowForgotPassword(false)}>
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;