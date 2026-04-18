import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ variant = 'default' }) {
    const navigate = useNavigate();
    const logoSrc = process.env.PUBLIC_URL + '/Parkify.png';

    return (
        <nav className={`main-navbar ${variant}`}>
            <div className="nav-container">
                <div className="nav-logo" onClick={() => navigate('/')}> 
                    <img
                        className="logo-img"
                        src={logoSrc}
                        alt="Parkify logo"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                    <span className="logo-text">Parkify</span>
                </div>

                <div className="nav-links">
                    <Link to="/" className="nav-link">Features</Link>
                    <Link to="/" className="nav-link">AI Engine</Link>
                    <Link to="/" className="nav-link">Contact</Link>
                </div>

                <div className="nav-auth-btns">
                    {variant === 'login' ? (
                        <Link to="/register" className="nav-btn secondary">Sign Up</Link>
                    ) : variant === 'register' ? (
                        <Link to="/login" className="nav-btn secondary">Log In</Link>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Log In</Link>
                            <Link to="/register" className="nav-btn primary">Get Started</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;