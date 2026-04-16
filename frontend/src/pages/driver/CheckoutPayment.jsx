import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CheckoutPayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('STRIPE');
  const [cashSuccess, setCashSuccess] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const initRes = await api.post('/driver/payment/initiate', {
        bookingId,
        paymentMethod: selectedMethod
      });

      if (selectedMethod === 'CASH') {
        // Cash booking confirmed — show success screen
        setCashSuccess(true);
        setIsProcessing(false);
        return;
      }

      const url = initRes.data.checkoutUrl;
      if (url) {
        window.location.href = url;
      } else {
        setError('No checkout URL received from server');
        setIsProcessing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed');
      setIsProcessing(false);
    }
  };

  if (cashSuccess) {
    return (
      <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 className="card-title" style={{ color: 'var(--color-success-text)', marginBottom: '0.75rem' }}>
            Booking Confirmed!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            Your slot has been reserved for <strong>Booking #{bookingId}</strong>.
          </p>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            💵 Please pay <strong>Cash on Arrival</strong> at the parking slot. An SMS notification has been sent to the owner.
          </p>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => navigate('/driver/dashboard')}
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <div className="card">
        <h2 className="card-title mb-4">Secure Checkout</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Choose your payment method for <strong>Booking #{bookingId}</strong>.
        </p>

        {/* Payment Method Selector */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            onClick={() => setSelectedMethod('STRIPE')}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '8px',
              border: `2px solid ${selectedMethod === 'STRIPE' ? '#635BFF' : 'var(--color-border)'}`,
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: selectedMethod === 'STRIPE' ? 'rgba(99,91,255,0.07)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>💳</div>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Pay with Stripe</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Card / Online</div>
          </div>

          <div
            onClick={() => setSelectedMethod('CASH')}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: '8px',
              border: `2px solid ${selectedMethod === 'CASH' ? '#16a34a' : 'var(--color-border)'}`,
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: selectedMethod === 'CASH' ? 'rgba(22,163,74,0.07)' : 'transparent',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>💵</div>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Cash on Arrival</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Pay at the slot</div>
          </div>
        </div>

        {selectedMethod === 'CASH' && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(22,163,74,0.08)',
            border: '1px solid rgba(22,163,74,0.3)',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: 'var(--color-text)',
            marginBottom: '1.25rem'
          }}>
            📱 An SMS will be sent to the slot owner once you confirm. Please bring the exact amount in cash.
          </div>
        )}

        {error && (
          <div className="mb-4" style={{
            padding: '0.75rem',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            backgroundColor: selectedMethod === 'CASH' ? '#16a34a' : '#635BFF'
          }}
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing
            ? 'Processing...'
            : selectedMethod === 'CASH'
              ? '✅ Confirm Cash Booking'
              : '💳 Pay with Stripe'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPayment;
