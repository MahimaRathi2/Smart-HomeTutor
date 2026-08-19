import React from 'react';

export const TutorProfileHeader = ({ tutor = {} }) => {
  const tutorName = tutor.fullName || (tutor.user ? tutor.user.name : 'Verified Educator');
  const rating = tutor.rating || 5.0;
  const totalReviews = tutor.totalReviews || 0;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary, #213547)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, flexShrink: 0 }}>
          {tutorName.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: 800, color: 'var(--primary, #213547)' }}>
            {tutorName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '3px 10px', borderRadius: '14px', border: '1px solid #fcd34d' }}>
              <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i>
              {rating} Rating ({totalReviews} Reviews)
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              <i className="fa-solid fa-location-dot" style={{ color: '#ef4444', marginRight: '4px' }}></i>
              {tutor.location || tutor.city || 'Verified Location'}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              <i className="fa-solid fa-laptop-house" style={{ color: '#0284c7', marginRight: '4px' }}></i>
              {tutor.mode || 'Online & Home Tuition'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary, #213547)' }}>
          ₹{tutor.fee || 0} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ hr</span>
        </div>
        <span style={{ fontSize: '12px', color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
          {tutor.available !== false ? '● Available for Sessions' : '○ Busy'}
        </span>
      </div>
    </div>
  );
};
