import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import './Register.css';

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.timeout = 15000; // 15s timeout


function Register() {
    const [step, setStep] = useState(1); // 1: Role, 1.5: Owner Questions, 2: Form, 3: OTP
    const [role, setRole] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        parkingName: '',
        address: '',
        hasInventory: false,
        hasServiceCenter: false
    });

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        if (selectedRole === 'owner') {
            setStep(1.5);
        } else {
            setStep(2);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 1. මුලින්ම Register විස්තර යවලා OTP එකක් ගෙන්න ගන්නවා
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const userPayload = {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            address: formData.address || '',
            role: role === 'owner' ? 'PARKING_OWNER' : 'DRIVER',
            hasInventory: formData.hasInventory,
            hasServiceCenter: formData.hasServiceCenter
        };

        try {
            const { data } = await axios.post('/api/auth/register-otp', userPayload);
            alert(data.message || "OTP sent to your email!");
            setStep(3);
        } catch (error) {
            const message = error.response?.data?.error || error.response?.data?.message || error.message || "Registration failed. Try again.";
            alert(message);
            console.error('Registration error detail:', error);
        } finally {
            setLoading(false);
        }
    };

    // 2. OTP එක verify කරලා Register එක සම්පූර්ණ කරනවා
    const handleVerifyAndRegister = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-register-otp', {
                email: formData.email,
                otp: otp
            });

            // Register වුණ ගමන් විස්තර ටික save කරගන්නවා
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userEmail", formData.email);
            localStorage.setItem("userRole", role.toLowerCase());
            localStorage.setItem("userId", response.data.id);

            alert("Registration Successful!");

            // Dashboard එකට redirect කරනවා
            if (role === 'owner') {
                navigate('/po-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            const message = error.response?.data?.error || error.response?.data?.message || "Invalid OTP. Please try again.";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <Navbar variant="register" />
            <div className="auth-container">
                
                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <div className="role-selection-card">
                        <h2 style={{fontWeight:'800', color:'#2D4057', fontSize:'2rem'}}>Join Parkify as a...</h2>
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

                {/* Step 1.5: Owner Questions */}
                {step === 1.5 && (
                    <div className="role-selection-card">
                        <h2 style={{fontWeight:'800', color:'#2D4057', fontSize:'2rem'}}>Tell us about your parking place</h2>
                        <div className="questions-grid">
                            <div className="question-box">
                                <h3>Do you have an inventory in your parking place?</h3>
                                <div className="radio-group">
                                    <label>
                                        <input type="radio" name="inventory" value="yes" onChange={() => setFormData({...formData, hasInventory: true})} /> Yes
                                    </label>
                                    <label>
                                        <input type="radio" name="inventory" value="no" onChange={() => setFormData({...formData, hasInventory: false})} /> No
                                    </label>
                                </div>
                            </div>
                            <div className="question-box">
                                <h3>Do you have a vehicle service center in your parking place?</h3>
                                <div className="radio-group">
                                    <label>
                                        <input type="radio" name="service" value="yes" onChange={() => setFormData({...formData, hasServiceCenter: true})} /> Yes
                                    </label>
                                    <label>
                                        <input type="radio" name="service" value="no" onChange={() => setFormData({...formData, hasServiceCenter: false})} /> No
                                    </label>
                                </div>
                            </div>
                        </div>
                        <button className="btn-auth-primary" onClick={() => setStep(2)} style={{marginTop:'20px'}}>Continue</button>
                        <button className="btn-back" onClick={() => setStep(1)}>Go Back</button>
                    </div>
                )}

                {/* Step 2: Registration Form */}
                {step === 2 && (
                    <div className="auth-card scrollable-form">
                        <h2 style={{fontWeight:'800', color:'#2D4057'}}>Create {role === 'driver' ? 'Driver' : 'Owner'} Account</h2>
                        <form className="register-form" onSubmit={handleRegisterSubmit}>
                            <div className="input-row">
                                <input name="firstName" type="text" placeholder="First Name" required onChange={handleChange} className="form-input-styled" />
                                <input name="lastName" type="text" placeholder="Last Name" required onChange={handleChange} className="form-input-styled" />
                            </div>
                            <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="form-input-styled" />
                            <input name="phoneNumber" type="tel" placeholder="Phone Number" required onChange={handleChange} className="form-input-styled" />
                            
                            {role === 'owner' && (
                                <>
                                    <input name="parkingName" type="text" placeholder="Parking Location Name" onChange={handleChange} className="form-input-styled" />
                                    <input name="address" type="text" placeholder="Address" onChange={handleChange} className="form-input-styled" />
                                </>
                            )}

                            <input name="password" type="password" placeholder="Create Password" required onChange={handleChange} className="form-input-styled" />
                            <button type="submit" className="btn-auth-primary" disabled={loading}>
                                {loading ? "Sending OTP..." : "Register Now"}
                            </button>
                        </form>
                        <button className="btn-back" onClick={() => setStep(1)}>Go Back</button>
                    </div>
                )}

                {/* Step 3: OTP Verification */}
                {step === 3 && (
                    <div className="auth-card-plain">
                        <h2 style={{fontWeight:'800', color:'#2D4057'}}>Verify Email</h2>
                        <p>Enter the 6-digit code sent to <b>{formData.email}</b></p>
                        <input 
                            type="text" 
                            placeholder="Enter OTP" 
                            className="form-input-styled" 
                            style={{textAlign:'center', fontSize:'1.5rem', marginTop:'20px'}}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button onClick={handleVerifyAndRegister} className="btn-auth-primary" disabled={loading}>
                            {loading ? "Verifying..." : "Verify & Complete"}
                        </button>
                        <button className="btn-back" onClick={() => setStep(2)}>Back to Form</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;