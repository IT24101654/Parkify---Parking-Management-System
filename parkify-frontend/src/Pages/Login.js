import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import './Login.css'; 

function Login() {
    const [email, setEmail] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const navigate = useNavigate();

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setShowOTP(true);
    };

    const verifyOTP = () => {
        let role = "driver";
        if (email.includes("admin")) role = "super_admin";
        else if (email.includes("owner")) role = "owner";

        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
        navigate('/dashboard');
    };

    return (
        <div className="auth-page">
            <Navbar variant="login" />
            <div className="auth-split-container">
                <div className="auth-visual" style={{background: 'linear-gradient(rgba(45, 64, 87, 0.7), rgba(45, 64, 87, 0.7)), url("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1000")'}}>
                    <div className="visual-text">
                        <h2>Smart Parking for Smart Cities.</h2>
                        <p>Join thousands of users optimizing their daily commute with AI.</p>
                    </div>
                </div>
                <div className="auth-form-container">
                    {!showOTP ? (
                        <div className="auth-card-plain">
                            <h2 style={{fontWeight:'800', color:'#2D4057'}}>Welcome Back</h2>
                            <p style={{color:'#7A868E', marginBottom:'30px'}}>Please enter your credentials to access your account.</p>
                            <form onSubmit={handleLoginSubmit}>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="name@company.com" required onChange={(e)=>setEmail(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label>Password</label>
                                    <input type="password" placeholder="••••••••" required />
                                </div>
                                <div className="forgot-pass" style={{textAlign:'right', marginBottom:'20px'}}>
                                    <Link to="/forgot-password" style={{color:'#FF8E72', fontWeight:'600', textDecoration:'none'}}>Forgot Password?</Link>
                                </div>
                                <button type="submit" className="btn-auth-primary">Send OTP</button>
                            </form>
                            <p className="auth-footer" style={{marginTop:'25px', textAlign:'center', color:'#7A868E'}}>
                                Don't have an account? <Link to="/register" style={{color:'#2D4057', fontWeight:'700'}}>Sign Up Now</Link>
                            </p>
                        </div>
                    ) : (
                        <div className="auth-card-plain">
                            <h2 style={{fontWeight:'800', color:'#2D4057'}}>Verify OTP</h2>
                            <p style={{color:'#7A868E'}}>We've sent a 6-digit code to <strong>{email}</strong></p>
                            <div className="otp-inputs" style={{display:'flex', gap:'10px', justifyContent:'center', margin:'30px 0'}}>
                                {[1,2,3,4,5,6].map(i => <input key={i} type="text" maxLength="1" className="otp-field" />)}
                            </div>
                            <button onClick={verifyOTP} className="btn-auth-primary">Verify & Login</button>
                            <p className="auth-footer" style={{marginTop:'20px', textAlign:'center'}}>
                                Didn't receive code? <Link to="#" style={{color:'#FF8E72', fontWeight:'700'}}>Resend OTP</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;