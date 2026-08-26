import React, { useState, useEffect } from 'react';
import {
  FaGraduationCap,
  FaRotateRight,
  FaSpinner,
  FaTriangleExclamation,
  FaUserSlash,
  FaMagnifyingGlass,
  FaUser,
  FaCircle,
} from 'react-icons/fa6';

export const MyTutorsTab = ({ onFindTutor }) => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyTutors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/student/my-tutors');
      const data = await res.json();
      if (res.ok && data.success) {
        setTutors(data.tutors || []);
      } else {
        setError(data.message || 'Failed to load regular tutors.');
      }
    } catch (err) {
      console.error('Fetch My Tutors error:', err);
      setError('Unable to load tutors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTutors();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'TU';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="my-tutors-tab" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0' }}>
      {/* SECTION HEADER */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f2a4a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaGraduationCap style={{ color: '#0284c7' }} /> My Tutors
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            Your active regular-class educators assigned to your subscription.
          </p>
        </div>
        <button
          type="button"
          className="dash-btn dash-btn-outline"
          onClick={fetchMyTutors}
          style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <FaRotateRight /> Refresh
        </button>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <FaSpinner className="fa-spin" style={{ color: '#0284c7', fontSize: '32px', marginBottom: '12px' }} />
          <p style={{ fontWeight: 600 }}>Loading your regular tutors...</p>
        </div>
      ) : error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '16px 20px', borderRadius: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <FaTriangleExclamation />
          <span>{error}</span>
        </div>
      ) : tutors.length === 0 ? (
        /* EMPTY STATE */
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '2px dashed #cbd5e1',
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '520px',
          margin: '30px auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 16px auto'
          }}>
            <FaUserSlash />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f2a4a', margin: '0 0 8px 0' }}>
            My Tutors
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
            You don't have any regular-class tutors yet.
          </p>
          <button
            type="button"
            className="dash-btn dash-btn-primary"
            onClick={onFindTutor}
            style={{ padding: '12px 28px', fontSize: '14px', background: '#0284c7', borderColor: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
          >
            <FaMagnifyingGlass /> Find a Tutor
          </button>
        </div>
      ) : (
        /* TUTOR CARDS GRID */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '20px'
        }}>
          {tutors.map((tutor) => (
            <div
              key={tutor._id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.2s ease',
              }}
            >
              {/* AVATAR */}
              {tutor.avatar ? (
                <img
                  src={tutor.avatar}
                  alt={tutor.name}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #0284c7',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '800',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(tutor.name)}
                </div>
              )}

              {/* CARD DETAILS */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0f2a4a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaUser style={{ color: '#0284c7', fontSize: '14px' }} /> {tutor.name}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '13.5px', color: '#475569', fontWeight: 600 }}>
                  {tutor.subject || 'Tuition'}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                  <FaCircle style={{ color: '#22c55e', fontSize: '8px' }} />
                  <span>Regular Classes Tutor</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
