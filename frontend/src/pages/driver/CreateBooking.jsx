import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateBooking = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSlot, setSelectedSlot] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [computedHours, setComputedHours] = useState(0);
  const [computedPrice, setComputedPrice] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await api.get('/driver/slots');
        setSlots(res.data);
      } catch (err) {
        setError('Failed to load slots');
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  useEffect(() => {
    if (selectedSlot && startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (end > start && start >= new Date()) {
        const diffMs = end - start;
        let hours = Math.ceil(diffMs / (1000 * 60 * 60));
        if (hours <= 0) hours = 1;
        
        setComputedHours(hours);
        
        const slot = slots.find(s => s.id === parseInt(selectedSlot) || s.id === selectedSlot);
        if (slot) {
          setComputedPrice(hours * slot.hourlyRate);
        }
      } else {
        setComputedHours(0);
        setComputedPrice(0);
      }
    }
  }, [selectedSlot, startTime, endTime, slots]);

  const getTimeError = () => {
    if (!startTime || !endTime) return null;
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid Date/Time entered";
    if (start < new Date(new Date().getTime() - 60000)) return "Start time cannot be in the past";
    if (end <= start) return "End time must be after Start time";
    return null;
  };

  const isValidTime = () => {
    return getTimeError() === null && startTime && endTime;
  };

  const getMinDateTime = () => {
    const now = new Date();
    // Offset for local timezone to ensure ISO format matches the user's local clock
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/driver/booking', {
        slotId: selectedSlot,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      });
      // Redirect to checkout with the new booking ID
      navigate(`/driver/checkout/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading available slots...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 className="card-title mb-4">Book a Parking Slot</h2>

        {error && (
          <div className="mb-4" style={{ padding: '0.75rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: '4px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Location</label>
            <select 
              className="form-input" 
              required 
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
            >
              <option value="" disabled>-- Choose a slot --</option>
              {slots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.locationName} - {slot.address} (Rs. {slot.hourlyRate}/hr)
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="form-group mt-4" style={{ flex: 1 }}>
              <label className="form-label">Start Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                required 
                min={getMinDateTime()}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="form-group mt-4" style={{ flex: 1 }}>
              <label className="form-label">End Time</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                required 
                min={startTime || getMinDateTime()}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {getTimeError() && (
            <div className="mt-3" style={{ padding: '0.5rem', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: '4px', fontSize: '0.875rem' }}>
              ⚠ {getTimeError()}
            </div>
          )}

          {computedHours > 0 && computedPrice > 0 && (
            <div className="mt-4" style={{ padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Duration:</span>
                <span style={{ fontWeight: '500' }}>{computedHours} {computedHours === 1 ? 'hour' : 'hours'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem' }}>
                <span style={{ color: 'var(--color-text-light)' }}>Total Cost:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Rs. {computedPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="mt-4">
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }} 
              disabled={isSubmitting || !selectedSlot || !isValidTime()}
            >
              {isSubmitting ? 'Securing Slot...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBooking;
