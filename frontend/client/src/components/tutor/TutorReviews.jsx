import React from 'react';

export const TutorReviews = ({ reviews = [] }) => {
  return (
    <div style={{ marginTop: '36px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary, #213547)', marginBottom: '16px' }}>
        <i className="fa-solid fa-comments" style={{ color: '#0284c7', marginRight: '8px' }}></i>
        Student Ratings & Reviews ({reviews.length})
      </h3>

      {reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reviews.map((r, idx) => {
            const studentName = r.student ? (r.student.name || r.student.email) : 'Verified Student';
            const dateStr = r.createdAt
              ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Recent';

            return (
              <div key={r._id || idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '14px' }}>{studentName}</strong>
                  <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className={`fa-${star <= r.rating ? 'solid' : 'regular'} fa-star`}></i>
                    ))}
                    <span style={{ marginLeft: '4px' }}>{r.rating}.0</span>
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>{r.comment}</p>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '8px' }}>
                  <i className="fa-solid fa-clock"></i> {dateStr}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          <i className="fa-solid fa-comment-slash" style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '8px' }}></i>
          <p style={{ margin: 0 }}>No student reviews submitted yet for this tutor.</p>
        </div>
      )}
    </div>
  );
};
