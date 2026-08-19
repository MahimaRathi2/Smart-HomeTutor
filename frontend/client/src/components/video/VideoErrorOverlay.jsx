import React from 'react';

export const VideoErrorOverlay = ({ isOpen, title, message, userRole = 'student', onReturn }) => {
  if (!isOpen) return null;

  const dashboardPath = `/dashboard/${userRole ? userRole.toLowerCase() : 'student'}`;

  return (
    <div className="error-overlay" style={{ display: 'flex' }}>
      <div className="error-card">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h3>{title || 'Connection Error'}</h3>
        <p>{message || 'Unable to access media devices or establish WebRTC peer connection.'}</p>
        <button
          type="button"
          onClick={onReturn || (() => { window.location.href = dashboardPath; })}
          className="btn-return"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
