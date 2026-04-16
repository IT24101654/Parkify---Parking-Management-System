import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DriverDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bookingsRes, paymentsRes] = await Promise.all([
          api.get('/driver/bookings'),
          api.get('/driver/payments')
        ]);
        setBookings(bookingsRes.data);
        setPayments(paymentsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Driver Dashboard</h1>
        <Link to="/driver/book" className="btn btn-primary">Book New Slot</Link>
      </div>

      <div className="card mb-4">
        <h2 className="card-title mb-4">My Bookings</h2>
        {bookings.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>You have no bookings yet.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.slot?.locationName}</td>
                    <td>
                      <div className="mb-1">{new Date(b.startTime).toLocaleString()}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>to {new Date(b.endTime).toLocaleString()}</div>
                    </td>
                    <td>Rs. {b.totalAmount}</td>
                    <td>
                      <span className={`badge ${b.status === 'PENDING' ? 'badge-warning' : b.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'PENDING' && (
                        <Link to={`/driver/checkout/${b.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Pay Now</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="card-title mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No payment records found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Booking Ref</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.gatewayTransactionId || 'Pending'}</td>
                    <td>BKG_{p.booking?.id}</td>
                    <td>Rs. {p.amount}</td>
                    <td>{p.paymentMethod}</td>
                    <td>
                      <span className={`badge ${p.status === 'PAID' ? 'badge-success' : p.status === 'FAILED' ? 'badge-danger' : 'badge-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
