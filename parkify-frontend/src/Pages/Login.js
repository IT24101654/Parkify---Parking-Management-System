import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import './Login.css'; 
axios.defaults.baseURL = 'http://localhost:8080';
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
    const navigate = useNavigate();

    // Login logic
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setLoginError('Email and password are required.');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/api/auth/login', {
                email: email.trim().toLowerCase(),
                password: password
            });
            setLoginError('');
            setShowOTP(true);
        } catch (error) {
            const err = error.response?.data?.error || error.message || "Network Error";
            setLoginError(err);
            console.error('Login request failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Password reset logic
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
            console.error('forgot-password request failed:', error);
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
            console.error('reset-password request failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-otp', {
                email: email,
                otp: otp
            });
            const { token, role, id } = response.data;
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", role.toLowerCase());
            localStorage.setItem("userId", id);
            navigate(role === 'PARKING_OWNER' ? '/po-dashboard' : '/dashboard');
        } catch (error) {
            alert("Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Navbar variant="login" />
            <div className="auth-split-container">
                <div className="auth-visual" style={{background: 'linear-gradient(rgba(45,64,87,0.7),rgba(45,64,87,0.7)), url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000")'}}>
                    <div className="visual-text">
                        <h2>Smart Parking for Smart Cities.</h2>
                    </div>
                </div>

                <div className="auth-form-container">
                    {!showOTP && !showForgotPassword ? (
                        <div className="auth-card-plain">
                            <h2 style={{fontWeight:'800', color:'#2D4057'}}>Welcome Back</h2>
                            {loginError && <div style={{color:'#d9534f', marginBottom:'12px', fontWeight:'600'}}>{loginError}</div>}
                            <form onSubmit={handleLoginSubmit}>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="name@company.com" required onChange={(e)=>setEmail(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label>Password</label>
                                    <input type="password" placeholder="••••••••" required onChange={(e)=>setPassword(e.target.value)} />
                                </div>
                                <button type="submit" className="btn-auth-primary" disabled={loading}>
                                    {loading ? "Sending OTP..." : "Send OTP"}
                                </button>
                            </form>
                            <div style={{marginTop:'15px', textAlign:'center'}}>
                                <button className="btn-link" onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}>
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    ) : showForgotPassword ? (
                        <div className="auth-card-plain">
                            <h2 style={{fontWeight:'800', color:'#2D4057'}}>Reset Password</h2>
                            {resetMessage && <div style={{color:'#d9534f', marginBottom:'12px', fontWeight:'600'}}>{resetMessage}</div>}
                            {resetStep === 1 ? (
                                <>
                                    <div className="input-group">
                                        <label>Email Address</label>
                                        <input type="email" value={forgotEmail} placeholder="Enter your email" required onChange={(e)=>setForgotEmail(e.target.value)} />
                                    </div>
                                    <button onClick={requestPasswordReset} className="btn-auth-primary" disabled={loading}>Send Reset OTP</button>
                                </>
                            ) : (
                                <>
                                    <div className="input-group"><label>OTP</label><input type="text" onChange={(e)=>setForgotOtp(e.target.value)} /></div>
                                    <div className="input-group"><label>New Password</label><input type="password" onChange={(e)=>setNewPassword(e.target.value)} /></div>
                                    <button onClick={performPasswordReset} className="btn-auth-primary" disabled={loading}>Reset Password</button>
                                </>
                            )}
                            <div style={{marginTop:'15px', textAlign:'center'}}>
                                <button className="btn-link" onClick={() => setShowForgotPassword(false)}>
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-card-plain">
                            <h2 style={{fontWeight:'800', color:'#2D4057'}}>Verify OTP</h2>
                            <p>Code sent to <strong>{email}</strong></p>
                            <input type="text" className="form-input-styled" style={{textAlign:'center', fontSize:'1.5rem'}} onChange={(e) => setOtp(e.target.value)} />
                            <button onClick={verifyOTP} className="btn-auth-primary" style={{marginTop:'20px'}} disabled={loading}>Verify & Login</button>
                            <div style={{marginTop:'15px', textAlign:'center'}}>
                                <button className="btn-link" onClick={() => setShowOTP(false)}>
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