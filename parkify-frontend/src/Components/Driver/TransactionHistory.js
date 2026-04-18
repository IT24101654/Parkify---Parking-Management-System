import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReservationManagement.css'; // Let's use the same cohesive CSS

const P = {
    primary:    '#7A806B', // Dried Thyme
    secondary:  '#B5ACA3', // Moth Wing
    accent:     '#A17060', // Redend Point
    bg:         '#EBE7E0', // Accessible Beige
    light:      '#F4EFEB', // White Duck
    primaryBg:  'rgba(122, 128, 107, 0.1)',
    primaryBdr: 'rgba(122, 128, 107, 0.3)',
};

const TransactionHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatTxId = (payment) => {
        const raw = payment.gatewayTransactionId || `LOCAL-${payment.id}`;
        return raw.length > 15 ? raw.substring(0, 15) + '...' : raw;
    };

    useEffect(() => {
        const fetchPayments = async () => {
        try {
            // Check if we are returning from a Stripe Checkout (Local Webhook Emulation)
            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get('session_id');
            if (sessionId) {
                try {
                    const token = localStorage.getItem('token');
                    await axios.get(`http://localhost:8080/api/payments/verify?session_id=${sessionId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    // Clean URL to prevent re-verifying on reload
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (verifyErr) {
                    console.error("Failed to verify local session", verifyErr);
                }
            }

            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/payments/my', {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        const reason = window.prompt("Please provide a reason for this refund request:");
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/payments/${paymentId}/refund`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.alert("Refund request submitted successfully!");
            window.location.reload();
        } catch (err) {
            window.alert("Error submitting request: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: P.primary }}>Loading history...</div>;

    return (
        <div style={{ width: '100%', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {payments.length === 0 ? (
                        <div className="empty-state">
                            <div className="resv-empty-icon-wrap" style={{ margin: '0 auto 1rem', width: '60px', height: '60px', borderRadius: '50%', background: P.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '2.4rem', color: P.primary }}>history</span>
                            </div>
                            <h3 style={{ color: P.primary, margin: 0 }}>No transactions found</h3>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Date</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment, i) => (
                                        <tr key={i}>
                                        <td>
                                            <span 
                                                className="resv-id-chip" 
                                                title={payment.gatewayTransactionId || `LOCAL-${payment.id}`}
                                            >
                                                #{formatTxId(payment)}
                                            </span>
                                        </td>
                                        <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                            <td>{payment.paymentMethod}</td>
                                            <td>
                                                <span style={{ 
                                                    display: 'inline-block', 
                                                    padding: '4px 10px', 
                                                    backgroundColor: payment.status === 'PAID' ? 'rgba(76, 175, 80, 0.1)' : 
                                                                    payment.status === 'REFUND_REQUESTED' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(0,0,0,0.05)', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                    color: payment.status === 'PAID' ? '#4CAF50' : 
                                                            payment.status === 'REFUND_REQUESTED' ? '#FF9800' : P.primary
                                                }}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '800', color: P.primary }}>Rs. {payment.amount}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {payment.status === 'PAID' ? (
                                                    <button 
                                                        style={{ 
                                                            cursor: 'pointer', padding: '0.4rem 0.8rem', fontSize: '0.85rem', 
                                                            border: `1px solid ${P.accent}`, background: 'transparent', 
                                                            color: P.accent, borderRadius: '6px', fontWeight: 'bold',
                                                            transition: 'all 0.2s'
                                                        }} 
                                                        onClick={() => requestRefund(payment.id)}
                                                        onMouseOver={(e) => { e.target.style.background = P.accent; e.target.style.color = '#fff'; }}
                                                        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = P.accent; }}
                                                    >
                                                        Request Refund
                                                    </button>
                                                ) : (
                                                    <span style={{ color: P.secondary }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
        </div>
    );
};

export default TransactionHistory;
