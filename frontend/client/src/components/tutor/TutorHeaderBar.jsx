import React from 'react';

export const TutorHeaderBar = ({ onRequestPayout, onRequestCertificate, isApproved = true }) => {
  return (
    <div className="dashboard-header-bar">
      <div className="dashboard-title">
        <h1>Educator Control Panel</h1>
        <p>Manage your teaching schedule, accept booking requests, review student attendance, and request payouts.</p>
      </div>
      <div className="dashboard-actions" style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          className="dash-btn dash-btn-primary"
          onClick={isApproved ? onRequestCertificate : undefined}
          disabled={!isApproved}
          style={!isApproved ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          title={!isApproved ? "Tutor approval is required to request certificates" : ""}
        >
          <i className="fa-solid fa-award"></i> Request Certificate
        </button>
        <button
          type="button"
          className="dash-btn dash-btn-accent"
          onClick={isApproved ? onRequestPayout : undefined}
          disabled={!isApproved}
          style={!isApproved ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          title={!isApproved ? "Tutor approval is required to request payouts" : ""}
        >
          <i className="fa-solid fa-hand-holding-dollar"></i> Request Payout
        </button>
      </div>
    </div>
  );
};
