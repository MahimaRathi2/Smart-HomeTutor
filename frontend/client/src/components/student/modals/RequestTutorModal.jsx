import React, { useState } from 'react';

export const RequestTutorModal = ({ isOpen, onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [board, setBoard] = useState('CBSE');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      const res = await fetch('/api/student/tutor-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, board, budget, notes }),
      });
      const data = await res.json();
      if (data.success) {
        if (onSuccess) onSuccess(data.message || 'Your custom tutor request has been submitted successfully!');
        onClose();
        setSubject('');
        setGrade('');
        setBudget('');
        setNotes('');
      } else {
        alert(data.message || 'Failed to submit tutor request.');
      }
    } catch (err) {
      console.error('Submit Tutor Request Error:', err);
      alert('Connection error submitting tutor request.');
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <div className="tr-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div className="tr-modal-card" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '22px', color: '#64748b', cursor: 'pointer' }}
        >
          &times;
        </button>

        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-paper-plane" style={{ color: '#0284c7' }}></i> Submit Custom Tutor Request
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          Can't find the perfect tutor? Submit your custom requirement and top tutors will reach out to you.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Subject <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" className="tr-input" placeholder="e.g. Physics / Calculus" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Grade / Class <span style={{ color: '#dc2626' }}>*</span></label>
              <input type="text" className="tr-input" placeholder="e.g. Class 10 / JEE Prep" value={grade} onChange={(e) => setGrade(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Academic Board</label>
              <select className="tr-select" value={board} onChange={(e) => setBoard(e.target.value)}>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="IB">IB International</option>
                <option value="State">State Board</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Max Budget (₹/hr)</label>
              <input type="number" className="tr-input" placeholder="e.g. 600" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Additional Requirements</label>
            <textarea className="tr-textarea" rows="3" placeholder="Preferred location, timings, female tutor preference..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="dash-btn dash-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="dash-btn dash-btn-primary" disabled={submitted}>
              {submitted ? <span><i className="fa-solid fa-spinner fa-spin"></i> Processing...</span> : 'Broadcast Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
