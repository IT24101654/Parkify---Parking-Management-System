import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './POReservationOverview.css';

const P = {
    primary:    '#B08974', // Sand/Taupe (Owner Palette theme)
    secondary:  '#9C8C79',
    accent:     '#b26969d4', // Rose/Red
    bg:         '#EBE7E0',
    light:      '#F4EFEB',
    primaryBdr: 'var(--bdr-color, #E1D9CD)', // Neutral border
};

const RefundManagement = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        loadRefunds();
    }, []);

    const loadRefunds = async () => {
        try {
            const token = localStorage.getItem('token');
            const ownerId = localStorage.getItem('userId');
            const res = await axios.get(`http://localhost:8080/api/payments/owner/${ownerId}/refunds/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRefunds(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (id, approve) => {
        if (!window.confirm(`Are you sure you want to ${approve ? 'APPROVE' : 'REJECT'} this refund?`)) return;
        setProcessingId(id);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/payments/owner/refunds/${id}/process`, { approve }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await loadRefunds();
        } catch (err) {
            alert('Failed to process refund: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: P.primary }}>Checking requests...</div>;

    return (
        <div style={{ width: '100%' }}>
            
            <div className="sc-modal-stripe" style={{ background: 'transparent', borderBottom: `2px solid ${P.primaryBdr}`, padding: '16px 24px', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined sc-modal-cat-icon icon-center" style={{ color: P.primary, fontSize: '32px' }}>
                    currency_exchange
                </span>
                <div style={{ marginLeft: '16px', textAlign: 'left' }}>
                    <div className="sc-modal-cat-label" style={{ color: P.primary, fontWeight: '700', letterSpacing: '1.5px', fontSize: '0.85rem' }}>ACTION REQUIRED</div>
                    <div className="sc-modal-cat-name" style={{ color: P.primary, fontSize: '1.6rem', fontWeight: '800' }}>
                        Refund Requests
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                {refunds.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: P.light, border: `1px dashed ${P.primaryBdr}`, borderRadius: '12px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: P.secondary, marginBottom: '1rem' }}>
                            check_circle
                        </span>
                        <h3 style={{ color: P.secondary, marginBottom: '0.5rem' }}>All caught up!</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No pending refunds awaiting your review.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {refunds.map(refund => (
                            <div key={refund.id} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                background: P.light,
                                padding: '1.5rem',
                                border: `1px solid ${P.primaryBdr}`,
                                borderRadius: '12px'
                            }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#4A4A4A', fontSize: '1.2rem' }}>
                                        Refund Request #{refund.id}
                                    </h4>
                                    <p style={{ margin: '0', fontSize: '1rem', color: P.secondary, fontWeight: '500' }}>
                                        <strong>Resv #:</strong> {refund.reservation?.id} | <strong>Driver:</strong> {refund.reservation?.driverName}
                                    </p>
                                    <div style={{ marginTop: '0.8rem', padding: '0.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', fontStyle: 'italic', color: '#666' }}>
                                        "{refund.refundReason || 'No specific reason provided.'}"
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <h3 style={{ margin: '0', color: P.accent, fontSize: '1.6rem', fontWeight: '800' }}>
                                        Rs. {refund.amount}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <button 
                                            disabled={processingId === refund.id}
                                            style={{ cursor: processingId === refund.id ? 'not-allowed' : 'pointer', padding: '0.6rem 1rem', fontSize: '0.9rem', border: `1px solid ${P.secondary}`, background: 'transparent', color: P.secondary, borderRadius: '6px', fontWeight: 'bold' }} 
                                            onClick={() => handleProcess(refund.id, false)}
                                            onMouseOver={(e) => { if(!processingId) { e.target.style.background = P.secondary; e.target.style.color = '#fff'; } }}
                                            onMouseOut={(e) => { if(!processingId) { e.target.style.background = 'transparent'; e.target.style.color = P.secondary; } }}
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            disabled={processingId === refund.id}
                                            style={{ cursor: processingId === refund.id ? 'not-allowed' : 'pointer', padding: '0.6rem 1rem', fontSize: '0.9rem', border: `1px solid ${P.primary}`, background: P.primary, color: '#fff', borderRadius: '6px', fontWeight: 'bold' }} 
                                            onClick={() => handleProcess(refund.id, true)}
                                            onMouseOver={(e) => { if(!processingId) { e.target.style.background = '#8F6F5E'; } }}
                                            onMouseOut={(e) => { if(!processingId) { e.target.style.background = P.primary; } }}
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RefundManagement;
