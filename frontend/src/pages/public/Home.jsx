import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Parkify</h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        The seamless way to manage parking payments. Whether you're booking a spot for the day or managing a whole lot, we've got you covered.
      </p>
      <div className="flex gap-4" style={{ justifyContent: 'center' }}>
        <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
          Get Started
        </Link>
        <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
          Login to Portal
        </Link>
      </div>

      <div className="flex justify-between gap-4" style={{ marginTop: '4rem', textAlign: 'left' }}>
        <div className="card" style={{ flex: 1 }}>
          <h3 className="card-title mb-2">For Drivers</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Find available parking slots, securely book in advance, and pay seamlessly using our integrated gateway. Track your past receipts and transaction statuses in real-time.
          </p>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h3 className="card-title mb-2">For Owners</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            List your parking spaces and watch the revenue stream in. Keep track of payouts, monitor bookings, and manage refund requests efficiently from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
