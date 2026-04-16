import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="nav-brand">
          Parkify
        </Link>
        <div className="nav-links">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{color: 'white'}}>Register</Link>
            </>
          ) : (
            <>
              {user.role === 'DRIVER' && (
                <>
                  <Link to="/driver/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/driver/transactions" className="nav-link">Transactions</Link>
                </>
              )}
              {user.role === 'OWNER' && (
                <>
                  <Link to="/owner/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/owner/payouts" className="nav-link">Payout Tracker</Link>
                </>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link">System Admin</Link>
                  <Link to="/admin/refunds" className="nav-link">Refunds Queue</Link>
                </>
              )}
              <span className="nav-link" style={{color: 'var(--color-text-main)'}}>
                Hello, {user.fullName}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
