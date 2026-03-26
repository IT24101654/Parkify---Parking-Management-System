import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import './Register.css';


axios.defaults.timeout = 15000;

function Register() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [driverPreferences, setDriverPreferences] = useState("");

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phoneNumber: '', password: '',
        parkingName: '', address: '', hasInventory: false, hasServiceCenter: false
    });

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(selectedRole === 'owner' ? 1.5 : 2);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleVehicle = (vehicle) => {
        if (selectedVehicles.includes(vehicle)) {
            setSelectedVehicles(selectedVehicles.filter(v => v !== vehicle));
        } else {
            setSelectedVehicles([...selectedVehicles, vehicle]);
        }
    };

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
            alert(error.response?.data?.error || error.response?.data?.message || "Registration failed.");
        } finally { setLoading(false); }
    };

    const handleVerifyAndRegister = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/verify-register-otp', {
                email: formData.email,
                otp: otp,
                role: role === 'owner' ? 'PARKING_OWNER' : 'DRIVER'  
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userRole", response.data.role.toUpperCase());
            localStorage.setItem("userId", response.data.id);

            if (role === 'driver') {
                setStep(4);
            } else {
                alert("Registration Successful!");
                navigate('/po-dashboard');
            }
        } catch (error) {
            alert(error.response?.data?.error || "Invalid OTP. Please try again.");
        } finally { setLoading(false); }
    };

    const handleFinalizeDriver = async () => {
        setLoading(true);
        try {

            console.log("Saving preferences:", { selectedVehicles, driverPreferences });
            localStorage.setItem("selectedVehicles", JSON.stringify(selectedVehicles));
            alert("Setup Complete! Welcome to Parkify.");
            navigate('/driver-dashboard');
        } catch (error) {
            alert("Something went wrong.");
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
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="input-row">
                                <input name="firstName" type="text" placeholder="First Name" required onChange={handleChange} className="form-input-styled" />
                                <input name="lastName" type="text" placeholder="Last Name" required onChange={handleChange} className="form-input-styled" />
                            </div>
                            <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="form-input-styled" />
                            <input name="phoneNumber" type="tel" placeholder="Phone Number" required onChange={handleChange} className="form-input-styled" />
                            <input name="password" type="password" placeholder="Create Password" required onChange={handleChange} className="form-input-styled" />
                            <button type="submit" className="btn-auth-primary" disabled={loading}>{loading ? "Sending OTP..." : "Register Now"}</button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="auth-card-plain text-center">
                        <h2 className="step-title">Verify Email</h2>
                        <p>Enter the 6-digit code sent to {formData.email}</p>
                        <input type="text" placeholder="OTP" className="form-input-styled text-center" onChange={(e) => setOtp(e.target.value)} />
                        <button onClick={handleVerifyAndRegister} className="btn-auth-primary" disabled={loading}>{loading ? "Verifying..." : "Verify & Complete"}</button>
                    </div>
                )}


                {step === 4 && (
                    <div className="role-selection-card">
                        <h2 className="step-title">What vehicles do you have?</h2>
                        <p>Select all that apply</p>
                        <div className="vehicle-grid">
                            {['Car', 'Bike', 'Van', 'Lorry'].map(v => (
                                <div key={v}
                                    className={`vehicle-option ${selectedVehicles.includes(v) ? 'active' : ''}`}
                                    onClick={() => toggleVehicle(v)}>
                                    <span className="material-symbols-outlined">
                                        {v === 'Car' ? 'directions_car' : v === 'Bike' ? 'motorcycle' : v === 'Van' ? 'airport_shuttle' : 'local_shipping'}
                                    </span>
                                    <p>{v}</p>
                                </div>
                            ))}
                        </div>
                        <button className="btn-auth-primary" disabled={selectedVehicles.length === 0} onClick={() => setStep(5)}>Next</button>
                    </div>
                )}

                {}
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
                                <div key={p.id}
                                    className={`pref-option ${driverPreferences === p.id ? 'active' : ''}`}
                                    onClick={() => setDriverPreferences(p.id)}>
                                    <span className="material-symbols-outlined">{p.icon}</span>
                                    <p>{p.label}</p>
                                </div>
                            ))}
                        </div>
                        <button className="btn-auth-primary" disabled={!driverPreferences} onClick={handleFinalizeDriver}>
                            {loading ? "Saving..." : "Go to Dashboard"}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Register;