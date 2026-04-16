import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, logRes] = await Promise.all([
          api.get('/admin/payments'),
          api.get('/admin/logs')
        ]);
        setPayments(payRes.data);
        setLogs(logRes.data);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading System Data...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', gap: '2rem', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>System Monitoring Dashboard</h2>
      </header>

      <div className="card" style={{ padding: '0' }}>
        <h3 style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Recent Transactions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>ID</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Driver ID</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Amount</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Settled</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 10).map(payment => (
                <tr key={payment.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>#{payment.id}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>UID: {payment.driver?.id}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Rs. {payment.amount}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ 
                        fontWeight: '500', 
                        color: payment.status === 'PAID' ? 'var(--color-success-text)' : 
                               payment.status === 'FAILED' ? 'var(--color-danger-text)' : 'var(--color-text)'
                    }}>
                        {payment.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>{payment.isSettled ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <h3 style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>System Audit Logs</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Timestamp</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Action</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', fontWeight: 'bold' }}>{log.action}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
