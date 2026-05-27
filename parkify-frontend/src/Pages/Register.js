import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import './Register.css';

axios.defaults.timeout = 30000;

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

/* ─── Password Field with Eye Icon + Strength Bar ───────────────────────── */
function PasswordStrengthField({ value, onChange, placeholder = 'Create Password' }) {
    const [showPw, setShowPw] = useState(false);
    const strength = getPasswordStrength(value);
    const isTooShort = strength === 'too-short';
    const meta = strength ? strengthMeta[strength] : null;

    return (
        <div className="password-field-wrapper">
            <div className="pw-input-row">
                <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder={placeholder}
                    required
                    value={value}
                    onChange={onChange}
                    className="form-input-styled"
                    style={isTooShort ? { borderColor: '#ef4444', marginBottom: 0 } : {}}
                />
                <button
                    type="button"
                    className="pw-toggle-btn"
                    onClick={() => setShowPw(v => !v)}
                    tabIndex={-1}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                    <span className="material-symbols-outlined">
                        {showPw ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            </div>
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

function Register() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [driverPreferences, setDriverPreferences] = useState('');

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', password: '',
        address: '', hasInventory: false, hasServiceCenter: false, nicNumber: ''
    });

    const [registerError, setRegisterError] = useState('');
    const [otpError, setOtpError] = useState('');

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(selectedRole === 'owner' ? 1.5 : 2);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleVehicle = (vehicle) => {
        setSelectedVehicles(prev =>
            prev.includes(vehicle) ? prev.filter(v => v !== vehicle) : [...prev, vehicle]
        );
    };

    /* ── Validation ── */
    const validateEmail = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    const validatePhone = (ph) => /^[0-9+\-\s]{7,15}$/.test(ph);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterError('');

        // Validate fields
        if (!formData.firstName.trim()) {
            setRegisterError('First name is required.');
            return;
        }
        if (!formData.lastName.trim()) {
            setRegisterError('Last name is required.');
            return;
        }
        if (!formData.email.trim() || !validateEmail(formData.email.trim())) {
            setRegisterError('Please enter a valid email address.');
            return;
        }
        if (!formData.phoneNumber.trim() || !validatePhone(formData.phoneNumber.trim())) {
            setRegisterError('Please enter a valid phone number (7-15 digits).');
            return;
        }

        const strength = getPasswordStrength(formData.password);
        if (!strength || strength === 'too-short') {
            setRegisterError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        const userPayload = {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            phoneNumber: formData.phoneNumber.trim(),
            address: formData.address || '',
            role: role === 'owner' ? 'PARKING_OWNER' : 'DRIVER',
            hasInventory: formData.hasInventory,
            hasServiceCenter: formData.hasServiceCenter,
            ...(role === 'driver' && formData.nicNumber ? { nicNumber: formData.nicNumber } : {})
        };

        try {
            const { data } = await axios.post('/api/auth/register-otp', userPayload);
            setStep(3);
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.message;
            if (msg?.toLowerCase().includes('email') || msg?.toLowerCase().includes('exists') || msg?.toLowerCase().includes('already')) {
                setRegisterError('An account with this email already exists. Please login instead.');
            } else if (error.code === 'ECONNABORTED') {
                setRegisterError('Server is taking too long. Please try again.');
            } else {
                setRegisterError(msg || 'Registration failed. Please check your details and try again.');
            }
        } finally { setLoading(false); }
    };

    const handleVerifyAndRegister = async () => {
        setOtpError('');
        if (!otp.trim()) {
            setOtpError('Please enter the OTP sent to your email.');
            return;
        }
        if (otp.trim().length !== 6) {
            setOtpError('OTP must be 6 digits.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-register-otp', {
                email: formData.email.trim().toLowerCase(),
                otp: otp.trim(),
                role: role === 'owner' ? 'PARKING_OWNER' : 'DRIVER'
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role.toUpperCase());
            localStorage.setItem('userId', response.data.id);

            if (role === 'driver') {
                setStep(4);
            } else {
                navigate('/po-dashboard');
            }
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.message;
            if (msg?.toLowerCase().includes('expired')) {
                setOtpError('OTP has expired. Please go back and register again.');
            } else if (msg?.toLowerCase().includes('invalid') || error.response?.status === 400) {
                setOtpError('Incorrect OTP. Please check the code sent to your email.');
            } else {
                setOtpError(msg || 'Invalid OTP. Please check and try again.');
            }
        } finally { setLoading(false); }
    };

    const handleFinalizeDriver = async () => {
        setLoading(true);
        try {
            localStorage.setItem('selectedVehicles', JSON.stringify(selectedVehicles));
            if (driverPreferences) {
                localStorage.setItem('driverPreferences', driverPreferences);
            }
            navigate('/driver-dashboard');
        } catch (error) {
            alert('Something went wrong.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <Navbar variant="register" />
            <div className="auth-container">

                {step === 1 && (
                    <div className="role-selection-card">
                        <h2 className="step-title">Join Parkify as a...</h2>
                        <div className="role-grid">
                            <div className="role-box" onClick={() => handleRoleSelect('driver')}>
                                <span className="material-symbols-outlined">directions_car</span>
                                <h3>Driver</h3>
                                <p>I want to find and book parking slots.</p>
                            </div>
                            <div className="role-box" onClick={() => handleRoleSelect('owner')}>
                                <span className="material-symbols-outlined">real_estate_agent</span>
                                <h3>Parking Owner</h3>
                                <p>I want to list and manage my parking spaces.</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 1.5 && (
                    <div className="role-selection-card">
                        <h2 className="step-title">Tell us about your place</h2>
                        <div className="questions-grid">
                            <div className="question-box">
                                <h3>Do you have an inventory?</h3>
                                <div className="radio-group">
                                    <label><input type="radio" name="inventory" onChange={() => setFormData({ ...formData, hasInventory: true })} /> Yes</label>
                                    <label><input type="radio" name="inventory" onChange={() => setFormData({ ...formData, hasInventory: false })} /> No</label>
                                </div>
                            </div>
                            <div className="question-box">
                                <h3>Do you have a service center?</h3>
                                <div className="radio-group">
                                    <label><input type="radio" name="service" onChange={() => setFormData({ ...formData, hasServiceCenter: true })} /> Yes</label>
                                    <label><input type="radio" name="service" onChange={() => setFormData({ ...formData, hasServiceCenter: false })} /> No</label>
                                </div>
                            </div>
                        </div>
                        <button className="btn-auth-primary" onClick={() => setStep(2)}>Continue</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="auth-card scrollable-form">
                        <h2 className="step-title">Create Account</h2>

                        {registerError && <p className="error-message">{registerError}</p>}

                        <form onSubmit={handleRegisterSubmit} noValidate>
                            <div className="input-row">
                                <input name="firstName" type="text" placeholder="First Name" required onChange={handleChange} className="form-input-styled" />
                                <input name="lastName" type="text" placeholder="Last Name" required onChange={handleChange} className="form-input-styled" />
                            </div>
                            <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="form-input-styled" />
                            <input name="phoneNumber" type="tel" placeholder="Phone Number (e.g. 0771234567)" required onChange={handleChange} className="form-input-styled" />

                            <PasswordStrengthField
                                value={formData.password}
                                onChange={handleChange}
                            />

                            {role === 'driver' && (
                                <input name="nicNumber" type="text" placeholder="National ID (NIC) (Optional)" onChange={handleChange} className="form-input-styled" />
                            )}

                            <button type="submit" className="btn-auth-primary" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Register Now'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="auth-card-plain text-center">
                        <h2 className="step-title">Verify Your Email</h2>
                        <p>
                            We've sent a 6-digit code to <strong>{formData.email}</strong>.
                            Check your inbox (and spam folder) and enter it below.
                        </p>

                        {otpError && <p className="error-message">{otpError}</p>}

                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            className="form-input-styled text-center"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        />
                        <button onClick={handleVerifyAndRegister} className="btn-auth-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Complete'}
                        </button>
                        <div style={{ marginTop: '12px' }}>
                            <button
                                type="button"
                                className="btn-auth-secondary"
                                onClick={() => { setStep(2); setOtp(''); setOtpError(''); }}
                            >
                                ← Go Back
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Vehicle Selection ── */}
                {step === 4 && (
                    <div className="role-selection-card">
                        <h2 className="step-title">What vehicles do you have?</h2>
                        <p>Select all that apply</p>
                        <div className="vehicle-grid">
                            {['Car', 'Bike', 'Van', 'Lorry'].map(v => (
                                <div
                                    key={v}
                                    className={`vehicle-option ${selectedVehicles.includes(v) ? 'active' : ''}`}
                                    onClick={() => toggleVehicle(v)}
                                >
                                    <span className="material-symbols-outlined">
                                        {v === 'Car' ? 'directions_car' : v === 'Bike' ? 'motorcycle' : v === 'Van' ? 'airport_shuttle' : 'local_shipping'}
                                    </span>
                                    <p>{v}</p>
                                </div>
                            ))}
                        </div>
                        <button className="btn-auth-primary" disabled={selectedVehicles.length === 0} onClick={() => setStep(5)}>
                            Next
                        </button>
                    </div>
                )}

                {/* ── Step 5: Preference ── */}
                {step === 5 && (
                    <div className="role-selection-card">
                        <h2 className="step-title">Your Preference</h2>
                        <p>What is most important when finding a slot?</p>
                        <div className="pref-list">
                            {[
                                { id: 'cheap', label: 'Cheapest Price', icon: 'payments' },
                                { id: 'near', label: 'Nearest Location', icon: 'near_me' },
                                { id: 'avail', label: 'Maximum Availability', icon: 'event_available' }
                            ].map(p => (
                                <div
                                    key={p.id}
                                    className={`pref-option ${driverPreferences === p.id ? 'active' : ''}`}
                                    onClick={() => setDriverPreferences(p.id)}
                                >
                                    <span className="material-symbols-outlined">{p.icon}</span>
                                    <p>{p.label}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn-auth-primary"
                            disabled={!driverPreferences || loading}
                            onClick={handleFinalizeDriver}
                        >
                            {loading ? 'Saving...' : 'Go to Dashboard'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Register;