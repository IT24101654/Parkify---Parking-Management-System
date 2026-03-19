import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import './Register.css';

function Register() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    
    // Form data state එක
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',

        parkingName: '',
        businessReg: '',
        address: ''
    });

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        // Backend එක බලාපොරොත්තු වන User object එක හදමු
        const userPayload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            role: role.toUpperCase() 
        };

        try {
            const response = await axios.post('http://localhost:8080/api/users/register', userPayload);
            console.log("Registered:", response.data);
            alert("Registration Successful! Please login.");
            navigate('/login');
        } catch (error) {
            alert(error.response?.data || "Registration failed. Try again.");
        }
    };

    return (
        <div className="auth-page">
            <Navbar variant="register" />
            <div className="auth-container">
                {step === 1 ? (
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
                ) : (
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
                            <button type="submit" className="btn-auth-primary">Create Account</button>
                        </form>
                        <button className="btn-back" onClick={() => setStep(1)}>Go Back</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;