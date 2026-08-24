import React, { useState, useEffect } from 'react';

export const ParentNotificationsTab = ({ onUnreadChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        const unreadCount = data.notifications.filter((n) => !n.isRead && !n.read).length;
        if (onUnreadChange) onUnreadChange(unreadCount);
      } else {
        setErrorMsg(data.message || 'Unable to load notifications.');
      }
    } catch (err) {
      console.error('Load parent notifications error:', err);
      setErrorMsg('Network error loading notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      loadNotifications();
    } catch (err) {
      console.error('Mark notification read error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
      loadNotifications();
    } catch (err) {
      console.error('Mark all notifications read error:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      loadNotifications();
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3>
          <i className="fa-solid fa-bell" style={{ color: '#7e22ce' }}></i> Parent Notifications Center
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="dash-btn dash-btn-outline" onClick={markAllRead} style={{ fontSize: '12px', padding: '6px 12px' }}>
            <i className="fa-solid fa-check-double"></i> Mark All as Read
          </button>
          <button type="button" className="dash-btn dash-btn-outline" onClick={loadNotifications} style={{ fontSize: '12px', padding: '6px 12px' }}>
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#7e22ce', marginBottom: '10px' }}></i>
            <p style={{ margin: 0 }}>Loading notifications...</p>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626', fontSize: '14px', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <i className="fa-regular fa-bell-slash" style={{ fontSize: '32px', color: '#cbd5e1', marginBottom: '10px' }}></i>
            <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '16px', fontWeight: 700 }}>No Notifications Yet</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Parent alerts for child classes, payments, and tutor updates will appear here.
            </p>
          </div>
        )}

        {!loading && !errorMsg && notifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((n) => {
              const isUnread = !n.isRead && !n.read;
              const dt = new Date(n.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={n._id}
                  style={{
                    background: isUnread ? '#faf5ff' : '#ffffff',
                    border: isUnread ? '1px solid #e9d5ff' : '1px solid #e2e8f0',
                    borderLeft: isUnread ? '4px solid #7e22ce' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#f3e8ff',
                      color: '#7e22ce',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    <i className="fa-solid fa-bell"></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: isUnread ? 800 : 700, color: '#0f2a4a' }}>
                        {n.title}
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{dt}</span>
                    </div>
                    <div
                      className="announcement-content-body"
                      style={{
                        height: 'auto',
                        maxHeight: 'none',
                        overflow: 'visible',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        fontSize: '13px',
                        color: '#334155',
                        lineHeight: '1.5',
                        margin: '0 0 10px 0',
                      }}
                    >
                      {n.message}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {n.actionUrl ? (
                        <a href={n.actionUrl} className="dash-btn dash-btn-primary" style={{ background: '#7e22ce', fontSize: '11px', padding: '3px 10px' }}>
                          View Details
                        </a>
                      ) : (
                        <div></div>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {isUnread && (
                          <button
                            type="button"
                            onClick={() => markRead(n._id)}
                            style={{ background: 'none', border: 'none', color: '#7e22ce', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            <i className="fa-solid fa-check"></i> Mark Read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteNotification(n._id)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
