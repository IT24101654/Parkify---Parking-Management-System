import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
    const navigate = useNavigate();
    const logoSrc = process.env.PUBLIC_URL + '/Parkify.png';

    return (
        <div className="Parkify-Landing">
            <nav className="navbar">
                <div className="nav-container">
                    <div className="logo">
                        <img
                            className="logo-img"
                            src={logoSrc}
                            alt="Parkify logo"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                        <span className="logo-text">Parkify</span>
                    </div>
                    <div className="nav-links">
                        <a href="#solutions" style={{textDecoration:'none', color:'#2D4057', fontWeight:'700'}}>Solutions</a>
                        <button className="btn-login" onClick={() => navigate('/login')} style={{background:'none', border:'none', cursor:'pointer', fontWeight:'bold', fontSize:'1rem', color:'#2D4057', marginLeft:'20px'}}>Log In</button>
                        <button onClick={() => navigate('/login')} style={{marginLeft:'20px', padding:'12px 25px', borderRadius:'12px', background:'#2D4057', color:'white', border:'none', cursor:'pointer', fontWeight:'700'}}>Get Started</button>
                    </div>
                </div>
            </nav>

            <header className="hero">
                <div className="badge-ai">⚡ PARKIFY AI ENGINE v2.0 LIVE</div>
                
                <h1>
                    <div className="type-container">
                        Empowering Cities with 
                    </div>
                </h1>
                <h1>
                    <div className="type-container">
                        <span>Smart Parking</span>
                    </div>
                </h1>
                <p>The world's most advanced AI-Based management system. Reduce congestion, automate billing, and maximize occupancy in real-time.</p>
                <div className="hero-btns">
                    <button onClick={() => navigate('/register')} style={{padding:'18px 40px', borderRadius:'15px', background:'#AE8E82', color:'white', border:'none', cursor:'pointer', fontWeight:'800', fontSize:'1.1rem', boxShadow:'0 10px 20px rgba(174, 142, 130, 0.3)'}}>Register Now</button>
                    <button style={{marginLeft:'20px', padding:'18px 40px', borderRadius:'15px', background:'#2D4057', color:'white', border:'none', cursor:'pointer', fontWeight:'800', fontSize:'1.1rem'}}>View Demo</button>
                </div>
            </header>

            <section id="solutions" className="features-section">
                <div className="grid-container">
                    {[
                        { icon: 'map', title: 'Parking Place', desc: 'Real-time slot monitoring and dynamic pricing.' },
                        { icon: 'event_available', title: 'Reservations', desc: 'Instant booking with automated slot hold system.' },
                        { icon: 'psychology', title: 'AI Assistant', desc: 'Personalized recommendations based on patterns.' },
                        { icon: 'payments', title: 'Payments', desc: 'Secure digital billing and automated transactions.' },
                        { icon: 'inventory_2', title: 'Inventory', desc: 'Track stock levels and automate maintenance alerts.' },
                        { icon: 'build', title: 'Vehicle Service', desc: 'Manage appointments and view service history.' }
                    ].map((module, index) => (
                        <div key={index} className="module-card">
                            <div className="icon-wrapper">
                                <span className="material-symbols-outlined">{module.icon}</span>
                            </div>
                            <h3 style={{fontSize:'1.5rem', marginBottom:'15px'}}>{module.title}</h3>
                            <p style={{color:'#7A868E'}}>{module.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer style={{background:'#2D4057', color:'white', padding:'60px 20px', textAlign:'center', marginTop:'80px'}}>
                <span className="material-symbols-outlined" style={{fontSize: '40px', marginBottom: '15px'}}>garage</span>
                <p>© 2026 Parkify AI Solutions. Leading the way in Smart Infrastructure.</p>
            </footer>
        </div>
    );
}

export default LandingPage;