import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import './Register.css';

function Register() {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep(2);
    };

    return (
        <div className="auth-page">
            <Navbar variant="register" />

            <div className="auth-container">
                {step === 1 ? (
                    <div className="role-selection-card">
                        <h2 style={{fontWeight:'800', color:'#2D4057', fontSize:'2rem'}}>Join Parkify as a...</h2>
                        <p style={{color:'#7A868E', marginBottom:'40px'}}>Select your account type to continue</p>

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
                        <p style={{color:'#7A868E', marginBottom:'20px'}}>Complete the form below to get started.</p>

                        <form className="register-form" onSubmit={() => navigate('/login')}>
                            <div className="input-row">
                                <input type="text" placeholder="First Name" required className="form-input-styled" />
                                <input type="text" placeholder="Last Name" required className="form-input-styled" />
                            </div>

                            <input type="email" placeholder="Email Address" required className="form-input-styled" />
                            <input type="tel" placeholder="Phone Number" required className="form-input-styled" />

                            {role === 'owner' && (
                                <>
                                    <input type="text" placeholder="Parking Location Name" required className="form-input-styled" />
                                    <input type="text" placeholder="Business Registration No" required className="form-input-styled" />
                                    <input type="text" placeholder="Address" required className="form-input-styled" />
                                </>
                            )}

                            <input type="password" placeholder="Create Password" required className="form-input-styled" />
                            <button type="submit" className="btn-auth-primary">Create Account</button>
                        </form>

                        <button className="btn-back" onClick={() => setStep(1)}>
                            Go Back to Selection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;