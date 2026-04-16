import { useState, useEffect } from 'react';
import api from '../../services/api';

const PayoutTracker = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await api.get('/owner/payouts');
        setPayouts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  if (loading) return <div>Loading payout data...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Earnings & Payouts Tracker</h2>
      
      <div className="card" style={{ padding: '0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Reference</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Total Earned</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Platform Fee (15%)</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Net Payout</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Date Sent</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No payouts have been processed for your account yet.
                  </td>
                </tr>
              ) : (
                payouts.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>{p.transferReferenceId}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Rs. {p.totalEarnings}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', color: 'var(--color-danger-text)' }}>-Rs. {p.platformFee}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', fontWeight: 'bold' }}>Rs. {p.netPayout}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                      <span style={{ color: p.status === 'PAID_OUT' ? 'var(--color-success-text)' : 'inherit' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>{new Date(p.paidAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayoutTracker;
