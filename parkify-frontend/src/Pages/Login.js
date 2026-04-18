import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import './Login.css';

axios.defaults.timeout = 15000;

/* ─── Password Strength (reused for reset-password field) ───────────────── */
function getPasswordStrength(pw) {
    if (!pw) return null;
    if (pw.length < 8) return 'too-short';
    const hasUpper = /[A-Z]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    const hasDigit = /[0-9]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    if (hasUpper && hasSpecial && hasDigit) return 'high';
    if ((hasLower || hasUpper) && hasDigit) return 'medium';
    return 'low';
}

const strengthMeta = {
    'too-short': { label: 'Minimum 8 characters required', cls: 'too-short' },
    'low': { label: 'Weak password', cls: 'low' },
    'medium': { label: 'Medium password', cls: 'medium' },
    'high': { label: 'Strong password', cls: 'high' },
};

function PasswordStrengthField({ value, onChange, placeholder = 'New Password' }) {
    const strength = getPasswordStrength(value);
    const isTooShort = strength === 'too-short';
    const meta = strength ? strengthMeta[strength] : null;
    return (
        <div className="password-field-wrapper">
            <input
                type="password"
                placeholder={placeholder}
                className="form-input-styled"
                required
                value={value}
                onChange={onChange}
                style={isTooShort ? { borderColor: '#ef4444', marginBottom: 6 } : {}}
            />
            {strength && (
                <>
                    <div className={`strength-bar-track strength-${meta.cls}`}>
                        <div className="strength-segment" />
                        <div className="strength-segment" />
                        <div className="strength-segment" />
                    </div>
                    {isTooShort
                        ? <p className="pw-error">{meta.label}</p>
                        : <p className={`strength-label ${meta.cls}`}>{meta.label}</p>
                    }
                </>
            )}
        </div>
    );
}

/* ─── Main Login Component ──────────────────────────────────────────────── */
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    /* forgot password state */
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetMessageType, setResetMessageType] = useState('error'); // 'error' | 'success'
    const [resetStep, setResetStep] = useState(1);

    /* multi-role state */
    const [showRoleSelect, setShowRoleSelect] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');

    const navigate = useNavigate();

    /* ── Login ── */
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setLoginError('Email and password are required.');
            return;
        }
        setLoginError('');
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', {
                email: email.trim().toLowerCase(),
                password: password
            });

            const { status, roles } = response.data;

            if (status === 'OTP_SENT') {
                setSelectedRole(roles[0]);
                setShowOTP(true);
            } else if (status === 'ROLE_SELECTION_REQUIRED') {
                setAvailableRoles(roles);
                setShowRoleSelect(true);
            }
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.message || 'Invalid email or password.';
            setLoginError(msg);
        } finally {
            setLoading(false);
        }
    };

    /* ── Role selection ── */
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
            setLoginError(error.response?.data?.error || 'Failed to select role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── OTP verify ── */
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
                case 'SUPER_ADMIN': navigate('/admin-dashboard'); break;
                case 'PARKING_OWNER': navigate('/po-dashboard'); break;
                case 'DRIVER': navigate('/driver-dashboard'); break;
                default: navigate('/');
            }
        } catch (error) {
            setLoginError(error.response?.data?.error || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Forgot password: step 1 — send OTP ── */
    const requestPasswordReset = async () => {
        setResetMessage('');
        setLoading(true);
        try {
            await axios.post('/api/users/forgot-password', {
                email: forgotEmail.trim().toLowerCase()
            });
            setResetMessageType('success');
            setResetMessage('✅ OTP sent! Check your email inbox.');
            setResetStep(2);
        } catch (error) {
            setResetMessageType('error');
            setResetMessage(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'No account found with that email address.'
            );
        } finally {
            setLoading(false);
        }
    };

    /* ── Forgot password: step 2 — verify OTP + set new password ── */
    const performPasswordReset = async () => {
        setResetMessage('');
        const strength = getPasswordStrength(newPassword);
        if (!strength || strength === 'too-short') {
            setResetMessageType('error');
            setResetMessage('New password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/users/reset-password', {
                email: forgotEmail,
                otp: forgotOtp,
                newPassword: newPassword
            });
            setResetMessageType('success');
            setResetMessage('✅ Password reset successful! You can now log in.');
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetStep(1);
                setResetMessage('');
                setForgotEmail('');
                setForgotOtp('');
                setNewPassword('');
            }, 1800);
        } catch (error) {
            setResetMessageType('error');
            setResetMessage(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Invalid or expired OTP. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const openForgotPassword = () => {
        setShowForgotPassword(true);
        setResetStep(1);
        setResetMessage('');
        setResetMessageType('error');
    };

    return (
        <div className="auth-page">
            <Navbar variant="login" />

            <div className="auth-split-container">

                {/* ── Left panel: hero image ── */}
                <div
                    className="auth-visual"
                    style={{
                        background: 'linear-gradient(rgba(45,64,87,0.7),rgba(45,64,87,0.7)), url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000")'
                    }}
                >
                    <div className="visual-text">
                        <h2>Smart Parking for Smart Cities.</h2>
                    </div>
                </div>

                {/* ── Right panel: forms ── */}
                <div className="auth-form-container">

                    {/* Login form */}
                    {!showOTP && !showForgotPassword && !showRoleSelect && (
                        <div className="auth-card">
                            <h2>Welcome Back</h2>

                            {loginError && <p className="error-message">{loginError}</p>}

                            <form onSubmit={handleLoginSubmit}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="form-input-styled"
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="form-input-styled"
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="submit" className="btn-auth-primary" disabled={loading}>
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>

                            <div className="auth-footer" style={{ marginTop: '16px' }}>
                                <button
                                    type="button"
                                    className="btn-auth-secondary"
                                    onClick={openForgotPassword}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Role selection */}
                    {showRoleSelect && (
                        <div className="auth-card">
                            <h2>Select Your Role</h2>
                            <p style={{ color: '#6b7280', marginBottom: 16, fontSize: '0.9rem' }}>
                                You have multiple roles on this account. Choose which one to log in as:
                            </p>
                            <div className="role-btn-container">
                                {availableRoles.map((role) => (
                                    <button
                                        key={role}
                                        className="btn-auth-secondary"
                                        onClick={() => handleRoleSelection(role)}
                                        disabled={loading}
                                    >
                                        {role.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OTP entry */}
                    {showOTP && (
                        <div className="auth-card">
                            <h2>Enter OTP</h2>
                            <p style={{ color: '#6b7280', marginBottom: 16, fontSize: '0.9rem' }}>
                                A 6-digit code has been sent to <strong>{email}</strong>.
                            </p>
                            {loginError && <p className="error-message">{loginError}</p>}
                            <input
                                placeholder="e.g. 123456"
                                className="form-input-styled"
                                required
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <button className="btn-auth-primary" onClick={verifyOTP} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    )}

                    {/* Forgot password */}
                    {showForgotPassword && (
                        <div className="auth-card">
                            <h2>Reset Password</h2>

                            {resetMessage && (
                                <p className={resetMessageType === 'success' ? 'success-message' : 'error-message'}>
                                    {resetMessage}
                                </p>
                            )}

                            {resetStep === 1 ? (
                                <>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 14 }}>
                                        Enter your registered email. We'll send you a one-time password.
                                    </p>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="form-input-styled"
                                        required
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                    />
                                    <button
                                        className="btn-auth-primary"
                                        onClick={requestPasswordReset}
                                        disabled={loading || !forgotEmail}
                                    >
                                        {loading ? 'Sending OTP...' : 'Send OTP'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 14 }}>
                                        Enter the OTP sent to <strong>{forgotEmail}</strong> and choose a new password.
                                    </p>
                                    <input
                                        placeholder="OTP Code"
                                        className="form-input-styled"
                                        required
                                        value={forgotOtp}
                                        onChange={(e) => setForgotOtp(e.target.value)}
                                    />
                                    <PasswordStrengthField
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="New Password"
                                    />
                                    <button
                                        className="btn-auth-primary"
                                        onClick={performPasswordReset}
                                        disabled={loading}
                                    >
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </>
                            )}

                            <div className="auth-footer" style={{ marginTop: '14px' }}>
                                <button
                                    type="button"
                                    className="btn-auth-secondary"
                                    onClick={() => { setShowForgotPassword(false); setResetStep(1); setResetMessage(''); }}
                                >
                                    ← Back to Login
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