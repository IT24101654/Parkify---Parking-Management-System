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
            setLoginError(error.message);
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
            alert('Invalid OTP');
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
            setResetStep(2);
        } catch (error) {
            setResetMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const performPasswordReset = async () => {
        setLoading(true);
        try {
            await axios.post('/api/users/reset-password', {
                email: forgotEmail,
                otp: forgotOtp,
                newPassword: newPassword
            });
            alert('Password reset successful');
            setShowForgotPassword(false);
        } catch (error) {
            setResetMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Navbar variant="login" />

            <div className="auth-split-container">

                <div className="auth-visual"
                    style={{
                        background: 'linear-gradient(rgba(45,64,87,0.7),rgba(45,64,87,0.7)), url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000")'
                    }}>
                    <div className="visual-text">
                        <h2>Smart Parking for Smart Cities.</h2>
                    </div>
                </div>

                <div className="auth-form-container">

                    {!showOTP && !showForgotPassword && !showRoleSelect && (
                        <div className="auth-card-plain">
                            <h2>Welcome Back</h2>

                            {loginError && <p style={{ color: 'red' }}>{loginError}</p>}

                            <form onSubmit={handleLoginSubmit}>
                                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

                                <button type="submit">
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>

                            <button onClick={() => setShowForgotPassword(true)}>
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    {showRoleSelect && (
                        <div>
                            <h2>Select Role</h2>
                            {availableRoles.map((role) => (
                                <button key={role} onClick={() => handleRoleSelection(role)}>
                                    {role}
                                </button>
                            ))}
                        </div>
                    )}

                    {showOTP && (
                        <div>
                            <h2>Enter OTP</h2>
                            <input onChange={(e) => setOtp(e.target.value)} />
                            <button onClick={verifyOTP}>Verify</button>
                        </div>
                    )}

                    {showForgotPassword && (
                        <div>
                            {resetStep === 1 ? (
                                <>
                                    <input type="email" onChange={(e) => setForgotEmail(e.target.value)} />
                                    <button onClick={requestPasswordReset}>Send OTP</button>
                                </>
                            ) : (
                                <>
                                    <input placeholder="OTP" onChange={(e) => setForgotOtp(e.target.value)} />
                                    <input placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} />
                                    <button onClick={performPasswordReset}>Reset</button>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default Login;