import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Driver/ReservationManagement.css'; // Let's use the same cohesive CSS

const P = {
    primary:    '#B08974', // Sand/Taupe
    secondary:  '#9C8C79', 
    accent:     '#b26969d4', // Rose/Red
    bg:         '#EBE7E0', 
    light:      '#F4EFEB', 
    primaryBg:  'rgba(176, 137, 116, 0.1)',
    primaryBdr: 'rgba(176, 137, 116, 0.3)',
};

const POTransactionHistory = ({ onDataLoaded }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatTxId = (payment) => {
        const raw = payment.gatewayTransactionId || `LOCAL-${payment.id}`;
        return raw.length > 15 ? raw.substring(0, 15) + '...' : raw;
    };

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem('token');
                const ownerId = localStorage.getItem('userId');
                const res = await axios.get(`http://localhost:8080/api/payments/owner/${ownerId}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data || [];
                setPayments(data);
                if (onDataLoaded) {
                    onDataLoaded(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: P.primary }}>Loading history...</div>;

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="sc-modal-stripe" style={{ background: 'transparent', borderBottom: `2px solid ${P.primaryBdr}`, padding: '16px 24px', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined sc-modal-cat-icon icon-center" style={{ color: P.primary, fontSize: '32px' }}>
                    receipt_long
                </span>
                <div style={{ marginLeft: '16px', textAlign: 'left' }}>
                    <div className="sc-modal-cat-label" style={{ color: P.primary, fontWeight: '700', letterSpacing: '1.5px', fontSize: '0.85rem' }}>TRANSACTIONS</div>
                    <div className="sc-modal-cat-name" style={{ color: '#4A4A4A', fontSize: '1.6rem', fontWeight: '800' }}>
                        Payment History
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
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
                                    <th>Driver / Resv #</th>
                                    <th>Date</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Revenue</th>
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
                                        <td>{payment.reservation ? `${payment.reservation.driverName} (Resv #${payment.reservation.id})` : 'Unknown'}</td>
                                        <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                        <td>{payment.paymentMethod}</td>
                                        <td>
                                            <span style={{ 
                                                display: 'inline-block', 
                                                padding: '4px 10px', 
                                                backgroundColor: payment.status === 'PAID' ? 'rgba(76, 175, 80, 0.1)' : 
                                                                payment.status === 'REFUND_REQUESTED' ? 'rgba(255, 152, 0, 0.1)' : 
                                                                payment.status === 'REFUNDED' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(0,0,0,0.05)', 
                                                borderRadius: '6px', 
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                color: payment.status === 'PAID' ? '#4CAF50' : 
                                                        payment.status === 'REFUND_REQUESTED' ? '#FF9800' : 
                                                        payment.status === 'REFUNDED' ? '#e74c3c' : P.primary
                                            }}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: '800', color: payment.status === 'REFUNDED' ? '#95a5a6' : P.primary, textDecoration: payment.status === 'REFUNDED' ? 'line-through' : 'none' }}>
                                            Rs. {payment.amount}
                                        </td>
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

export default POTransactionHistory;
