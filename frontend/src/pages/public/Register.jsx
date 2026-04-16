import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'DRIVER'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Strict Password Validation
    const pwdRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;
    if (!pwdRegex.test(formData.password)) {
      setError("Password must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 symbol (@#$%^&+=!).");
      return;
    }

    // Phone number validation (international format)
    const phoneRegex = /^\+[1-9]\d{7,14}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Phone number must be in international format (e.g. +94771234567).");
      return;
    }

    setIsSubmitting(true);
    
    const result = await register(formData.fullName, formData.email, formData.password, formData.role, formData.phoneNumber);
    
    if (result.success) {
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="card">
        <h2 className="card-title mb-4" style={{ textAlign: 'center' }}>Create Account</h2>
        
        {error && (
          <div className="mb-4" style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: '4px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4" style={{ padding: '0.75rem', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', borderRadius: '4px', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              className="form-input" 
              required 
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              required 
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              required 
              minLength="6"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              name="phoneNumber"
              className="form-input" 
              required 
              placeholder="+94771234567"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Include country code (e.g. +94 for Sri Lanka)</small>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">I am a...</label>
            <select name="role" className="form-input" value={formData.role} onChange={handleChange}>
              <option value="DRIVER">Driver (I want to book parking)</option>
              <option value="OWNER">Owner (I want to list my parking slots)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
