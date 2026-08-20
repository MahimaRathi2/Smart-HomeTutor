import React from 'react';

export const AdminHeaderBar = ({ onOpenAnnouncement, onExportPdf, onOpenScheduleClass }) => {
  return (
    <div className="dashboard-header-bar">
      <div className="dashboard-title">
        <h1>Platform Control & Governance</h1>
        <p>Monitor platform statistics, verify tutor applications, manage users, and review financial metrics.</p>
      </div>
      <div className="dashboard-actions">
        <button className="dash-btn dash-btn-outline" onClick={onOpenScheduleClass}>
          <i className="fa-solid fa-calendar-plus"></i> Schedule Class
        </button>
        <button className="dash-btn dash-btn-primary" style={{ background: '#b45309' }} onClick={onOpenAnnouncement}>
          <i className="fa-solid fa-paper-plane"></i> Broadcast Notification
        </button>
        <button className="dash-btn dash-btn-accent" onClick={onExportPdf}>
          <i className="fa-solid fa-file-export"></i> Export Report
        </button>
      </div>
    </div>
  );
};
