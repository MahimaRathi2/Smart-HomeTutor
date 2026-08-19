import React from 'react';

export const ParentStats = ({ stats = {} }) => {
  const attendanceRate = stats.attendanceRate || 'N/A';
  const gradeScore = stats.averageGradeScore || 'N/A';
  const assignedTutorsCount = stats.assignedTutorsCount !== undefined ? stats.assignedTutorsCount : '--';
  const pendingInvoices = stats.pendingInvoicesAmount !== undefined ? `₹${stats.pendingInvoicesAmount.toLocaleString('en-IN')}` : '₹0.00';

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Child Attendance Rate</span>
          <div className="stat-value">{attendanceRate}</div>
          <span className="stat-sub">
            <i className="fa-solid fa-check-double"></i> Overall Attendance
          </span>
        </div>
        <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
          <i className="fa-solid fa-clipboard-user"></i>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Current Grade Score</span>
          <div className="stat-value">{gradeScore}</div>
          <span className="stat-sub">
            <i className="fa-solid fa-graduation-cap"></i> Overall Grade Score
          </span>
        </div>
        <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
          <i className="fa-solid fa-trophy"></i>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Assigned Tutors</span>
          <div className="stat-value">{assignedTutorsCount}</div>
          <span className="stat-sub">
            <i className="fa-solid fa-chalkboard-user"></i> Active Educators
          </span>
        </div>
        <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
          <i className="fa-solid fa-chalkboard-user"></i>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Pending Invoices</span>
          <div className="stat-value">{pendingInvoices}</div>
          <span className="stat-sub negative">
            <i className="fa-solid fa-clock"></i> Tuition Billing
          </span>
        </div>
        <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
          <i className="fa-solid fa-file-invoice-dollar"></i>
        </div>
      </div>
    </div>
  );
};
