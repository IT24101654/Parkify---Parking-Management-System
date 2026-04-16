import { useState, useEffect } from 'react';
import api from '../../services/api';

const TransactionHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/driver/payments');
        setPayments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const requestRefund = async (paymentId) => {
    const reason = prompt("Please provide a reason for this refund request:");
    if (!reason) return;

    try {
      await api.post(`/driver/payment/${paymentId}/refund`, { reason });
      alert("Refund request submitted successfully!");
      window.location.reload();
    } catch (err) {
      alert("Error submitting request: " + (err.response?.data?.message || err.message));
    }
  };

  const downloadReceipt = async (paymentId) => {
      try {
          const res = await api.get(`/driver/payment/${paymentId}/invoice`);
          const invoice = res.data;
          alert(`INVOICE: ${invoice.invoiceNumber}\nSubtotal: Rs. ${invoice.subtotal}\nTax: Rs. ${invoice.tax}\nTotal Paid: Rs. ${invoice.totalAmount}\nGenerated: ${new Date(invoice.generatedAt).toLocaleString()}`);
      } catch (err) {
          alert('Could not retrieve invoice: ' + err.message);
      }
  };

  if (loading) return <div>Loading history...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Transaction History</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {payments.length === 0 ? (
           <p>No transactions found.</p>
        ) : (
          payments.map(payment => (
            <div key={payment.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Transaction #{payment.gatewayTransactionId || payment.id}</h4>
                <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Date: {new Date(payment.createdAt).toLocaleDateString()} | Method: {payment.paymentMethod}
                </p>
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ 
                      display: 'inline-block', 
                      padding: '0.2rem 0.5rem', 
                      backgroundColor: 'rgba(0,0,0,0.05)', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: payment.status === 'PAID' ? 'var(--color-success-text)' : 'inherit'
                  }}>
                    {payment.status}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <h3 style={{ margin: '0' }}>Rs. {payment.amount}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {payment.status === 'PAID' && (
                    <>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => downloadReceipt(payment.id)}>
                        View Receipt
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)' }} onClick={() => requestRefund(payment.id)}>
                        Request Refund
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
