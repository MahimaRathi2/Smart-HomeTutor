import React from 'react';

export const TutorHeaderBar = ({ onRequestPayout, onRequestCertificate }) => {
  return (
    <div className="dashboard-header-bar">
      <div className="dashboard-title">
        <h1>Educator Control Panel</h1>
        <p>Manage your teaching schedule, accept booking requests, review student attendance, and request payouts.</p>
      </div>
      <div className="dashboard-actions" style={{ display: 'flex', gap: '10px' }}>
        <button type="button" className="dash-btn dash-btn-primary" onClick={onRequestCertificate}>
          <i className="fa-solid fa-award"></i> Request Certificate
        </button>
        <button type="button" className="dash-btn dash-btn-accent" onClick={onRequestPayout}>
          <i className="fa-solid fa-hand-holding-dollar"></i> Request Payout
        </button>
      </div>
    </div>
  );
};
