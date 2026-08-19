import React, { useState } from 'react';
import { adminApi } from '../../../services/adminApi';

export const AddSubjectModal = ({ isOpen, onClose, onSuccess, defaultGrade = '' }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CBSE');
  const [grade, setGrade] = useState(defaultGrade || '');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setGrade(defaultGrade || '');
      setError('');
    }
  }, [isOpen, defaultGrade]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !category || !grade) {
      setError('Please fill in Subject Name, Category, and Grade.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await adminApi.addSubject({ name, category, grade, description });
      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
        setName('');
        setGrade('');
        setDescription('');
      } else {
        setError(res.message || 'Failed to add subject.');
      }
    } catch (err) {
      console.error(err);
      setError('Server error adding subject.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1250,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ background: '#0f2a4a', color: '#ffffff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}><i className="fa-solid fa-book-medical"></i> Add New Subject & Board</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f2a4a', marginBottom: '6px' }}>Subject Name *</label>
            <input
              type="text"
              placeholder="e.g. Advanced Calculus, Organic Chemistry"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f2a4a', marginBottom: '6px' }}>Board / Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              required
            >
              <option value="CBSE">CBSE Board</option>
              <option value="ICSE">ICSE Board</option>
              <option value="IB / IGCSE">IB / IGCSE International</option>
              <option value="State Board">State Board</option>
              <option value="Competitive Test Prep">Competitive Test Prep (JEE / NEET / SAT)</option>
              <option value="General">General / Skill Development</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f2a4a', marginBottom: '6px' }}>Grade / Target Class *</label>
            <input
              type="text"
              placeholder="e.g. Grade 9 to 12, JEE Aspirants"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              required
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f2a4a', marginBottom: '6px' }}>Description (Optional)</label>
            <textarea
              rows="3"
              placeholder="Brief details about syllabus coverage or curriculum focus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="dash-btn dash-btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="dash-btn dash-btn-primary" disabled={saving}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : 'Save Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
