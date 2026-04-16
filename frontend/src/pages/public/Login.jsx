import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      if (result.role === 'DRIVER') navigate('/driver/dashboard');
      else if (result.role === 'OWNER') navigate('/owner/dashboard');
      else navigate('/');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="card">
        <h2 className="card-title mb-4" style={{ textAlign: 'center' }}>Portal Login</h2>
        
        {error && (
          <div className="mb-4" style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: '4px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Don't have an account? <Link to="/register">Create one here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
