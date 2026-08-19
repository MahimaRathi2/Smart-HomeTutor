import React from 'react';

export const ChildSubjectProgress = ({ subjectProgress = [] }) => {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3>
          <i className="fa-solid fa-chart-line"></i> Child Subject Progress & Attendance
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id="parentSubjectProgressContainer">
        {/* Real API Subject Progress Items */}
        {subjectProgress.map((sp, idx) => (
          <div
            key={idx}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderLeft: `4px solid ${sp.progressBarColor || '#15803d'}`,
              padding: '14px 16px',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#0f2a4a', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
              <span>
                {sp.subject} &bull; {sp.tutorName} ({sp.childName})
              </span>
              <span style={{ color: sp.progressBarColor || '#15803d', fontWeight: 700 }}>
                {sp.gradeLabel} &bull; {sp.attendancePercentage}% Attendance
              </span>
            </div>
            <div className="progress-bar-container" style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div className="progress-bar-fill" style={{ width: `${sp.gradePercentage}%`, background: sp.progressBarColor || '#15803d', height: '100%' }}></div>
            </div>
          </div>
        ))}

        {/* Default Sample Demo Record if no dynamic progress records present */}
        {subjectProgress.length === 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderLeft: '4px solid #f59e0b', padding: '14px 16px', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#0f2a4a', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
              <span>
                Calculus & Mathematics &bull; Dr. Sarah Jenkins
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#b45309', background: '#fef3c7', border: '1px solid #fcd34d', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '8px' }}>
                  <i className="fa-solid fa-flask"></i> Sample Demo Record
                </span>
              </span>
              <span style={{ color: '#15803d', fontWeight: 700 }}>Grade A (96%) &bull; 100% Attendance</span>
            </div>
            <div className="progress-bar-container" style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div className="progress-bar-fill" style={{ width: '96%', background: '#15803d', height: '100%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
