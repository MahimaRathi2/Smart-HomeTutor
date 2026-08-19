import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/adminApi';

export const SecurityCenterModal = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSecurityAudit();
      if (res.success && (res.activityLogs || res.logs)) {
        setLogs(res.activityLogs || res.logs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Load Security Logs Error:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const actionText = (log.action || '').toLowerCase();
    const userText = (log.userEmail || log.userName || '').toLowerCase();
    const ipText = (log.ipAddress || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesQuery = !query || actionText.includes(query) || userText.includes(query) || ipText.includes(query);
    const matchesSeverity = severityFilter === 'all' || (log.severity || 'info').toLowerCase() === severityFilter;
    const matchesCategory = categoryFilter === 'all' || (log.category || 'auth').toLowerCase() === categoryFilter;

    return matchesQuery && matchesSeverity && matchesCategory;
  });

  const exportCSV = () => {
    const headers = ['Timestamp', 'Severity', 'Category', 'User', 'Action', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      new Date(l.createdAt || Date.now()).toISOString(),
      l.severity || 'info',
      l.category || 'auth',
      l.userEmail || l.userName || 'Anonymous',
      `"${(l.action || '').replace(/"/g, '""')}"`,
      l.ipAddress || '127.0.0.1'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '950px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* MODAL HEADER */}
        <div style={{ background: '#0f172a', color: '#ffffff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff' }}>Security Center & Threat Audit Monitor</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>Real-time authentication tracking, IP activity logs & security rule enforcement.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="dash-btn dash-btn-outline" style={{ color: '#38bdf8', borderColor: '#0284c7', padding: '6px 12px', fontSize: '12px' }} onClick={exportCSV}>
              <i className="fa-solid fa-file-csv"></i> Export CSV
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* FILTERS & SEARCH BAR */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Search Activity</label>
                <input
                  type="text"
                  placeholder="Search action, user, or IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Severity Level</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Event Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                >
                  <option value="all">All Categories</option>
                  <option value="auth">Authentication & Logins</option>
                  <option value="security">Security Alerts & 403s</option>
                  <option value="admin">Admin Operations</option>
                  <option value="user_action">User Activity</option>
                </select>
              </div>
            </div>
          </div>

          {/* AUDIT TABLE */}
          <div className="dash-table-wrapper" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Severity</th>
                  <th>Category</th>
                  <th>User / Initiator</th>
                  <th>Event Action Detail</th>
                  <th>Client IP</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}><i className="fa-solid fa-spinner fa-spin"></i> Loading security logs...</td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '25px', color: '#64748b' }}>No security logs found matching criteria.</td></tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr key={log._id || idx}>
                      <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td>
                        <span className={`status-pill ${log.severity === 'critical' ? 'status-cancelled' : log.severity === 'warning' ? 'status-pending' : 'status-confirmed'}`}>
                          {log.severity || 'info'}
                        </span>
                      </td>
                      <td><span style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>{log.category || 'auth'}</span></td>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>{log.userEmail || log.userName || 'System'}</td>
                      <td>{log.action}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
