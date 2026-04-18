import React, { useState } from 'react';
import axios from 'axios';
import './ReservationManagement.css'; // Use the same CSS for consistent UI styling

// Theme color extracted from Dashboard
const P = {
    primary:    '#7A806B', // Dried Thyme variant for the Payments topic
    primaryBg:  '#f5f6f4',
    primaryBdr: '#c2c5bc',
};

const CheckoutPayment = ({ reservationId, onCancel }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('STRIPE');
    const [cashSuccess, setCashSuccess] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Real endpoint will be implemented on backend in next phase
            const { data } = await axios.post(`http://localhost:8080/api/reservations/${reservationId}/pay`, 
                { paymentMethod: selectedMethod },
                { headers }
            );

            if (selectedMethod === 'CASH') {
                setCashSuccess(true);
                setIsProcessing(false);
                return;
            }

            const url = data.checkoutUrl;
            if (url) {
                window.location.href = url;
            } else {
                setError('No checkout URL received from the server.');
                setIsProcessing(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Payment initiation failed. Please try again.');
            setIsProcessing(false);
        }
    };

    if (cashSuccess) {
        return (
            <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', color: '#16a34a' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>check_circle</span>
                </div>
                <h2 style={{ color: '#16a34a', marginBottom: '0.75rem', fontWeight: 800 }}>Booking Confirmed!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                    Your slot has been reserved for <strong>Reservation #{reservationId}</strong>.
                </p>
                <div style={{
                    padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: '12px', marginTop: '1.5rem', marginBottom: '2rem'
                }}>
                    <span className="material-symbols-outlined" style={{ color: '#16a34a', marginBottom: '8px' }}>payments</span>
                    <p style={{ color: '#166534', margin: 0 }}>
                        Please pay <strong>Cash on Arrival</strong> at the parking slot. An SMS notification has been sent to the owner.
                    </p>
                </div>
                <button className="btn-submit resv-submit-btn" style={{ background: P.primary, width: '100%' }} onClick={onCancel}>
                    Return to Payments
                </button>
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            <div style={{ width: '100%' }}>
                {/* Identity stripe */}
                <div className="sc-modal-stripe" style={{ background: 'transparent', borderBottom: `2px solid ${P.primaryBdr}`, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="sc-modal-badge" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined sc-modal-cat-icon icon-center" style={{ color: P.primary, fontSize: '32px' }}>
                            account_balance_wallet
                        </span>
                        <div style={{ marginLeft: '16px', textAlign: 'left' }}>
                            <div className="sc-modal-cat-label" style={{ color: P.primary, fontWeight: '700', letterSpacing: '1.5px', fontSize: '0.85rem' }}>SECURE CHECKOUT</div>
                            <div className="sc-modal-cat-name" style={{ color: P.primary, fontSize: '1.6rem', fontWeight: '800' }}>
                                Reservation #{reservationId}
                            </div>
                        </div>
                    </div>
                    {onCancel && (
                        <button className="close-btn" style={{ color: P.primary, fontSize: '32px' }} onClick={onCancel} title="Cancel Checkout">&times;</button>
                    )}
                </div>

                <div className="form-header" style={{ borderBottom: 'none', padding: '32px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ color: '#4A4A4A', fontSize: '2rem', fontWeight: '800', marginBottom: '8px', textAlign: 'left' }}>Choose Payment Method</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>Select how you want to pay for Reservation #{reservationId}</p>
                </div>

                <div className="inventory-form" style={{ padding: '16px 24px 32px' }}>
                    {/* Payment Method Selector */}
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                        <div
                            onClick={() => setSelectedMethod('STRIPE')}
                            style={{
                                flex: 1, padding: '2rem 1.5rem', borderRadius: '14px',
                                border: `2px solid ${selectedMethod === 'STRIPE' ? '#7A806B' : P.primaryBdr}`,
                                cursor: 'pointer', textAlign: 'center',
                                backgroundColor: selectedMethod === 'STRIPE' ? 'rgba(122,128,107,0.06)' : '#fff',
                                boxShadow: selectedMethod === 'STRIPE' ? '0 4px 15px rgba(122,128,107,0.15)' : 'none',
                                transform: selectedMethod === 'STRIPE' ? 'translateY(-2px)' : 'translateY(0)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: selectedMethod === 'STRIPE' ? '#7A806B' : P.primary, marginBottom: '1rem' }}>credit_score</span>
                            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: selectedMethod === 'STRIPE' ? '#7A806B' : '#4A4A4A', marginBottom: '4px' }}>Pay with Stripe</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Secure Credit/Debit Card</div>
                        </div>

                        <div
                            onClick={() => setSelectedMethod('CASH')}
                            style={{
                                flex: 1, padding: '2rem 1.5rem', borderRadius: '14px',
                                border: `2px solid ${selectedMethod === 'CASH' ? '#5C6B51' : P.primaryBdr}`,
                                cursor: 'pointer', textAlign: 'center',
                                backgroundColor: selectedMethod === 'CASH' ? 'rgba(92,107,81,0.06)' : '#fff',
                                boxShadow: selectedMethod === 'CASH' ? '0 4px 15px rgba(92,107,81,0.15)' : 'none',
                                transform: selectedMethod === 'CASH' ? 'translateY(-2px)' : 'translateY(0)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: selectedMethod === 'CASH' ? '#5C6B51' : P.primary, marginBottom: '1rem' }}>payments</span>
                            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: selectedMethod === 'CASH' ? '#5C6B51' : '#4A4A4A', marginBottom: '4px' }}>Cash on Arrival</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pay directly at the slot</div>
                        </div>
                    </div>

                    {selectedMethod === 'CASH' && (
                        <div style={{
                            padding: '1.2rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                            borderRadius: '10px', fontSize: '0.95rem', color: '#166534', marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>sms</span>
                            An SMS will be sent to the slot owner once you confirm. Please bring the exact amount in cash.
                        </div>
                    )}

                    {error && (
                        <div className="alert-error" style={{ marginBottom: '1.5rem', borderRadius: '10px', padding: '1rem' }}>
                            <span className="material-symbols-outlined">error</span>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="form-actions" style={{ borderTop: `1px solid ${P.primaryBdr}`, paddingTop: '20px', display: 'flex', gap: '16px' }}>
                        {onCancel && <button type="button" className="btn-cancel" style={{ padding: '0.9rem', flex: 1, borderRadius: '10px', fontSize: '1.05rem', fontWeight: '600' }} onClick={onCancel}>Cancel</button>}
                        <button
                            type="button"
                            className="btn-submit resv-submit-btn"
                            style={{ 
                                flex: 2,
                                padding: '0.9rem',
                                borderRadius: '10px',
                                fontSize: '1.05rem',
                                fontWeight: '700',
                                letterSpacing: '0.5px',
                                background: selectedMethod === 'CASH' ? '#5C6B51' : '#7A806B',
                                opacity: isProcessing ? 0.7 : 1,
                                cursor: isProcessing ? 'not-allowed' : 'pointer'
                            }}
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing 
                                ? 'Processing...' 
                                : selectedMethod === 'CASH' 
                                    ? 'Confirm Cash Booking' 
                                    : 'Pay Securely with Stripe'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPayment;
