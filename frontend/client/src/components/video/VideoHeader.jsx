import React from 'react';

export const VideoHeader = ({
  subject = 'Online Tutoring Session',
  statusState = 'connecting',
  statusText = 'Connecting...',
  callTimerText = '00:00',
}) => {
  return (
    <header className="call-header">
      <div className="call-title-area">
        <div className="call-logo">
          <i className="fa-solid fa-video"></i> HomeTutor Classroom
        </div>
        <span className="class-badge">
          <i className="fa-solid fa-graduation-cap"></i> {subject}
        </span>
      </div>

      <div className="peer-info">
        <span className={`status-badge ${statusState}`}>
          {statusState === 'connected' ? (
            <i className="fa-solid fa-circle" style={{ fontSize: '9px', color: '#34d399' }}></i>
          ) : statusState === 'disconnected' ? (
            <i className="fa-solid fa-triangle-exclamation"></i>
          ) : (
            <i className="fa-solid fa-spinner fa-spin"></i>
          )}
          {' '}{statusText}
        </span>
        <span className="call-timer">{callTimerText}</span>
      </div>
    </header>
  );
};
