import React from 'react';

export const StudentHeaderBar = ({ onRequestTutor, onStartVideoCall, onTopupWallet, onToggleMobileMenu }) => {
  return (
    <div className="dashboard-header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={onToggleMobileMenu}
          aria-label="Open Student Hub Menu"
          title="Open Student Hub Menu"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <div className="dashboard-title">
          <h1>Student Learning Portal</h1>
          <p>Search tutors, track your learning progress, schedule classes, and manage your payments.</p>
        </div>
      </div>
    </div>
  );
};
