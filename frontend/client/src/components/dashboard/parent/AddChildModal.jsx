import React, { useState } from 'react';

export const AddChildModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [subjectsNeeded, setSubjectsNeeded] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !grade.trim()) {
      setErrorMsg('Child student email and grade are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/parent/child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          grade: grade.trim(),
          school: school.trim(),
          subjectsNeeded: subjectsNeeded.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message || 'Child account linked successfully!');
        setEmail('');
        setName('');
        setGrade('');
        setSchool('');
        setSubjectsNeeded('');
        if (onSuccess) onSuccess();
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1500);
      } else {
        setErrorMsg(data.message || 'Failed to link child account.');
      }
    } catch (err) {
      console.error('Add Child Error:', err);
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1050, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', position: 'relative' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-user-plus" style={{ color: '#7e22ce' }}></i> Add Child Profile
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* ALERTS */}
        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            <i className="fa-solid fa-circle-check"></i> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-box" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0f2a4a', marginBottom: '4px' }}>
              Child Registered Student Email *
            </label>
            <div className="input-field" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px' }}>
              <i className="fa-solid fa-envelope" style={{ color: '#7e22ce', marginRight: '8px' }}></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. child@student.com"
                required
                style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '14px' }}
              />
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>Child must be registered as a Student account first.</p>
          </div>

          <div className="input-box" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0f2a4a', marginBottom: '4px' }}>
              Child Full Name (Optional)
            </label>
            <div className="input-field" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px' }}>
              <i className="fa-solid fa-user" style={{ color: '#7e22ce', marginRight: '8px' }}></i>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="input-box">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0f2a4a', marginBottom: '4px' }}>
                Grade / Class *
              </label>
              <div className="input-field" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px' }}>
                <i className="fa-solid fa-graduation-cap" style={{ color: '#7e22ce', marginRight: '8px' }}></i>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. Class 10"
                  required
                  style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '14px' }}
                />
              </div>
            </div>

            <div className="input-box">
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0f2a4a', marginBottom: '4px' }}>
                School Name
              </label>
              <div className="input-field" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px' }}>
                <i className="fa-solid fa-school" style={{ color: '#7e22ce', marginRight: '8px' }}></i>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. DPS International"
                  style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>

          <div className="input-box" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#0f2a4a', marginBottom: '4px' }}>
              Subjects Needed (Comma separated)
            </label>
            <div className="input-field" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px' }}>
              <i className="fa-solid fa-book" style={{ color: '#7e22ce', marginRight: '8px' }}></i>
              <input
                type="text"
                value={subjectsNeeded}
                onChange={(e) => setSubjectsNeeded(e.target.value)}
                placeholder="e.g. Mathematics, Science, English"
                style={{ border: 'none', outline: 'none', width: '100%', padding: '10px 0', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyRight: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="dash-btn dash-btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="dash-btn dash-btn-primary" style={{ background: '#7e22ce', padding: '8px 22px', fontSize: '13px' }}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Linking...</> : <><i className="fa-solid fa-check"></i> Link Child Profile</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
