import React from 'react';

export const AdminOverviewTab = ({
  stats = {},
  activityLogs = []
}) => {
  const totalUsers = stats.totalUsers || 0;
  const grossRevenue = stats.grossRevenue || 0;
  const activeSessions = stats.activeSessions || 0;
  const pendingCount = stats.pendingVerificationsCount || 0;

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      {/* STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <div className="stat-value">{totalUsers}</div>
            <span className="stat-sub"><i className="fa-solid fa-arrow-up"></i> Registered on platform</span>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <i className="fa-solid fa-users"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Platform Gross Revenue</span>
            <div className="stat-value">₹{grossRevenue.toFixed(2)}</div>
            <span className="stat-sub"><i className="fa-solid fa-arrow-up"></i> Total transactions</span>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <i className="fa-solid fa-chart-pie"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Live Classes</span>
            <div className="stat-value">{activeSessions} Sessions</div>
            <span className="stat-sub"><i className="fa-solid fa-video"></i> Active bookings</span>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#6b21a8' }}>
            <i className="fa-solid fa-chalkboard"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Pending Verifications</span>
            <div className="stat-value">{pendingCount} Tutors</div>
            <span className="stat-sub negative"><i className="fa-solid fa-triangle-exclamation"></i> Action required</span>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <i className="fa-solid fa-id-badge"></i>
          </div>
        </div>
      </div>

      {/* SYSTEM AUDIT LOG */}
      <div className="dash-card" style={{ marginTop: '20px' }}>
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-list-ul"></i> Security & System Audit Feed</h3>
        </div>

        {activityLogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '13px' }}>
            No recent security activity logs found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            {activityLogs.slice(0, 8).map((log, idx) => (
              <div key={log._id || idx} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>{log.action}</div>
                <small style={{ color: '#64748b' }}>{new Date(log.createdAt || Date.now()).toLocaleString()} &bull; IP: {log.ipAddress || '127.0.0.1'}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
