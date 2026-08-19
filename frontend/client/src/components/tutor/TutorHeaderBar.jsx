import React from 'react';

export const TutorHeaderBar = ({ onRequestPayout }) => {
  return (
    <div className="dashboard-header-bar">
      <div className="dashboard-title">
        <h1>Educator Control Panel</h1>
        <p>Manage your teaching schedule, accept booking requests, review student attendance, and request payouts.</p>
      </div>
      <div className="dashboard-actions">
        <button className="dash-btn dash-btn-accent" onClick={onRequestPayout}>
          <i className="fa-solid fa-hand-holding-dollar"></i> Request Payout
        </button>
      </div>
    </div>
  );
};
