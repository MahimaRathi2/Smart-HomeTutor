import React, { useState } from 'react';

export const TutorBookingModal = ({ isOpen, onClose, tutorId, tutorName }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const response = await fetch('/api/student/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorProfileId: tutorId,
          message: message.trim(),
          isTrial: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlertMsg({ type: 'success', text: data.message || 'Demo class booking request sent successfully!' });
        setTimeout(() => {
          setMessage('');
          setAlertMsg({ type: '', text: '' });
          onClose();
        }, 1800);
      } else {
        setAlertMsg({ type: 'error', text: data.message || 'Failed to book demo class. Please make sure you are logged in as a student.' });
      }
    } catch (err) {
      console.error('Book demo class error:', err);
      setAlertMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-calendar-check" style={{ color: 'var(--accent, #f59e0b)' }}></i> Book Demo Class
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#475569' }}>
          Request a 1-on-1 trial demo class with <strong>{tutorName}</strong>.
        </p>

        {alertMsg.text && (
          <div style={{ background: alertMsg.type === 'success' ? '#dcfce7' : '#fef2f2', border: `1px solid ${alertMsg.type === 'success' ? '#86efac' : '#fca5a5'}`, color: alertMsg.type === 'success' ? '#166534' : '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            <i className={`fa-solid ${alertMsg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i> {alertMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0f2a4a', marginBottom: '6px' }}>
              Message for Tutor (Optional)
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Specify required subjects, grade level, preferred timings, or learning goals..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="dash-btn dash-btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="dash-btn dash-btn-primary" style={{ padding: '8px 22px', fontSize: '13px' }}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</> : <><i className="fa-solid fa-paper-plane"></i> Send Booking Request</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
