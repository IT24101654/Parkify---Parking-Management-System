import { useState, useEffect } from 'react';
import api from '../../services/api';

const OwnerDashboard = () => {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [slotsRes, bookingsRes, paymentsRes] = await Promise.all([
          api.get('/owner/slots'),
          api.get('/owner/bookings'),
          api.get('/owner/payments')
        ]);
        setSlots(slotsRes.data);
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

  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Owner Dashboard</h1>
      </div>

      <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Total Revenue</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success-text)' }}>
            Rs. {totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="card" style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Active Slots</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {slots.length}
          </p>
        </div>
        <div className="card" style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Total Bookings</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {bookings.length}
          </p>
        </div>
      </div>

      <div className="flex gap-4" style={{ flexDirection: 'column' }}>
        <div className="card">
          <h2 className="card-title mb-4">Recent Bookings on My Slots</h2>
          {bookings.length === 0 ? (
             <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No bookings received yet.</p>
          ) : (
             <div className="table-wrapper">
               <table className="data-table">
                 <thead>
                   <tr>
                     <th>Slot</th>
                     <th>Driver Name</th>
                     <th>Amount</th>
                     <th>Status</th>
                     <th>Date</th>
                   </tr>
                 </thead>
                 <tbody>
                   {bookings.slice(0, 5).map(b => (
                     <tr key={b.id}>
                       <td>{b.slot.locationName}</td>
                       <td>{b.driver.fullName}</td>
                       <td>Rs. {b.totalAmount}</td>
                       <td>
                         <span className={`badge ${b.status === 'PENDING' ? 'badge-warning' : b.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                           {b.status}
                         </span>
                       </td>
                       <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title mb-4">Payment Transactions (Payout Linked)</h2>
          {payments.length === 0 ? (
             <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No transactions recorded.</p>
          ) : (
             <div className="table-wrapper">
               <table className="data-table">
                 <thead>
                   <tr>
                     <th>Gateway Ref</th>
                     <th>Method</th>
                     <th>Amount</th>
                     <th>Status</th>
                     <th>Date</th>
                   </tr>
                 </thead>
                 <tbody>
                   {payments.map(p => (
                     <tr key={p.id}>
                       <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.gatewayTransactionId || '--'}</td>
                       <td>{p.paymentMethod}</td>
                       <td>Rs. {p.amount}</td>
                       <td>
                         <span className={`badge ${p.status === 'PAID' ? 'badge-success' : p.status === 'FAILED' ? 'badge-danger' : 'badge-warning'}`}>
                           {p.status}
                         </span>
                       </td>
                       <td>{new Date(p.createdAt).toLocaleString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
