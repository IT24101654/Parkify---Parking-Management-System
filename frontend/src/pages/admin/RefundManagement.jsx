import { useState, useEffect } from 'react';
import api from '../../services/api';

const RefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    try {
      const res = await api.get('/admin/refunds/pending');
      setRefunds(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id, approve) => {
    setProcessingId(id);
    try {
      await api.post(`/admin/refunds/${id}/process`, { approve });
      await loadRefunds();
    } catch (err) {
      alert('Failed to process refund: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Refund Management</h2>
      
      {refunds.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No pending refunds awaiting review.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {refunds.map(refund => (
            <div key={refund.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Refund Request #{refund.id}</h4>
                <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <strong>Payment ID:</strong> {refund.payment?.id} | <strong>Amount:</strong> Rs. {refund.payment?.amount}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontStyle: 'italic', fontSize: '0.95rem' }}>
                  "{refund.reason}"
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-outline" 
                  disabled={processingId === refund.id}
                  onClick={() => handleProcess(refund.id, false)}
                >
                  Reject
                </button>
                <button 
                  className="btn btn-primary" 
                  disabled={processingId === refund.id}
                  onClick={() => handleProcess(refund.id, true)}
                >
                  Approve Refund
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefundManagement;
