import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import './Login.css'; 

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 1. Send OTP Request
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email: email,
                password: password
            });
            alert(response.data.message); // OTP sent message
            setShowOTP(true);
        } catch (error) {
            alert(error.response?.data?.error || "Login Failed. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Verify OTP & Get JWT Token
    const verifyOTP = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/auth/verify-otp', {
                email: email,
                otp: otp
            });

            // බැක්එන්ඩ් එකෙන් ලැබෙන Token සහ Role එක ගන්න
            const { token, role, message } = response.data;
            
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", role.toLowerCase());
            localStorage.setItem("userEmail", email);

            alert(message);
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.error || "Invalid OTP");
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
                    {!showOTP ? (
                        <div className="auth-card-plain">
                            <h2 style={{fontWeight:'800', color:'#2D4057'}}>Welcome Back</h2>
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
                        </div>
                    ) : (
                        <div className="auth-card-plain">
                            <h2 style={{fontWeight:'800', color:'#2D4057'}}>Verify OTP</h2>
                            <p>Code sent to <strong>{email}</strong></p>
                            <input 
                                type="text" 
                                placeholder="Enter 6-digit OTP" 
                                className="form-input-styled" 
                                style={{textAlign:'center', fontSize:'1.5rem'}}
                                onChange={(e) => setOtp(e.target.value)} 
                            />
                            <button onClick={verifyOTP} className="btn-auth-primary" disabled={loading} style={{marginTop:'20px'}}>
                                {loading ? "Verifying..." : "Verify & Login"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;