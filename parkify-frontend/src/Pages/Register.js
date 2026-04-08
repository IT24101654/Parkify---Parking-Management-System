import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import './Register.css';

axios.defaults.timeout = 15000;

/* ─── Password Strength Logic ──────────────────────────────────────────── */
function getPasswordStrength(pw) {
    if (!pw) return null;
    if (pw.length < 8) return 'too-short';

    const hasUpper = /[A-Z]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    const hasDigit = /[0-9]/.test(pw);
    const hasLower = /[a-z]/.test(pw);

    // HIGH: uppercase + special char + digit + 8+ chars  e.g. "New@12345"
    if (hasUpper && hasSpecial && hasDigit) return 'high';
    // MEDIUM: letters + digit, no uppercase or special   e.g. "new12345"
    if ((hasLower || hasUpper) && hasDigit) return 'medium';
    // LOW: 8+ chars but no mix                           e.g. "12345678"
    return 'low';
}

const strengthMeta = {
    'too-short': { label: 'Minimum 8 characters required', cls: 'too-short' },
    'low': { label: 'Weak password', cls: 'low' },
    'medium': { label: 'Medium password', cls: 'medium' },
    'high': { label: 'Strong password', cls: 'high' },
};

/* ─── Password field with live strength bar ────────────────────────────── */
function PasswordStrengthField({ value, onChange, placeholder = 'Create Password' }) {
    const strength = getPasswordStrength(value);
    const isTooShort = strength === 'too-short';
    const meta = strength ? strengthMeta[strength] : null;

    return (
        <div className="password-field-wrapper">
            <input
                name="password"
                type="password"
                placeholder={placeholder}
                required
                value={value}
                onChange={onChange}
                className="form-input-styled"
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

/* ─── Main Register Component ───────────────────────────────────────────── */
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

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterError('');

        const strength = getPasswordStrength(formData.password);
        if (!strength || strength === 'too-short') {
            setRegisterError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        const userPayload = {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            address: formData.address || '',
            role: role === 'owner' ? 'PARKING_OWNER' : 'DRIVER',
            hasInventory: formData.hasInventory,
            hasServiceCenter: formData.hasServiceCenter,
            ...(role === 'driver' && formData.nicNumber ? { nicNumber: formData.nicNumber } : {})
        };

        try {
            const { data } = await axios.post('/api/auth/register-otp', userPayload);
            alert(data.message || 'OTP sent to your email!');
            setStep(3);
        } catch (error) {
            setRegisterError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Registration failed. Please check your details.'
            );
        } finally { setLoading(false); }
    };

    const handleVerifyAndRegister = async () => {
        setOtpError('');
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-register-otp', {
                email: formData.email,
                otp: otp,
                role: role === 'owner' ? 'PARKING_OWNER' : 'DRIVER'
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role.toUpperCase());
            localStorage.setItem('userId', response.data.id);

            if (role === 'driver') {
                setStep(4);
            } else {
                alert('Registration Successful!');
                navigate('/po-dashboard');
            }
        } catch (error) {
            setOtpError(
                error.response?.data?.error ||
                'Invalid OTP. Please check and try again.'
            );
        } finally { setLoading(false); }
    };

    const handleFinalizeDriver = async () => {
        setLoading(true);
        try {
            localStorage.setItem('selectedVehicles', JSON.stringify(selectedVehicles));
            alert('Setup Complete! Welcome to Parkify.');
            navigate('/driver-dashboard');
        } catch (error) {
            alert('Something went wrong.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <Navbar variant="register" />
            <div className="auth-container">

                {/* ── Step 1: Role Selection ── */}
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

                {/* ── Step 1.5: Parking Owner Questions ── */}
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

                {/* ── Step 2: Account Details ── */}
                {step === 2 && (
                    <div className="auth-card scrollable-form">
                        <h2 className="step-title">Create Account</h2>

                        {registerError && <p className="error-message">{registerError}</p>}

                        <form onSubmit={handleRegisterSubmit}>
                            <div className="input-row">
                                <input name="firstName" type="text" placeholder="First Name" required onChange={handleChange} className="form-input-styled" />
                                <input name="lastName" type="text" placeholder="Last Name" required onChange={handleChange} className="form-input-styled" />
                            </div>
                            <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="form-input-styled" />
                            <input name="phoneNumber" type="tel" placeholder="Phone Number" required onChange={handleChange} className="form-input-styled" />

                            {/* ── Password with strength meter ── */}
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

                {/* ── Step 3: OTP Verification ── */}
                {step === 3 && (
                    <div className="auth-card-plain text-center">
                        <h2 className="step-title">Verify Your Email</h2>
                        <p>
                            We've sent a 6-digit code to <strong>{formData.email}</strong>.
                            Enter it below to complete registration.
                        </p>

                        {otpError && <p className="error-message">{otpError}</p>}

                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            className="form-input-styled text-center"
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button onClick={handleVerifyAndRegister} className="btn-auth-primary" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Complete'}
                        </button>
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