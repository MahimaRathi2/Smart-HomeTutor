import React, { useState, useEffect } from 'react';

export const ParentNotificationsTab = ({ onUnreadChange, onSelectTab }) => {
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

  const dispatchUnreadCountUpdate = (count) => {
    if (typeof onUnreadChange === 'function') onUnreadChange(count);
    window.dispatchEvent(
      new CustomEvent('unreadCountUpdated', {
        detail: { unreadCount: count, role: 'parent' },
      })
    );
  };

  const markRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success && typeof data.unreadCount === 'number') {
        dispatchUnreadCountUpdate(data.unreadCount);
      }
    } catch (err) {
      console.error('Mark notification read error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      const res = await fetch('/api/notifications/read-all', { method: 'PATCH' });
      const data = await res.json();
      if (data.success && typeof data.unreadCount === 'number') {
        dispatchUnreadCountUpdate(data.unreadCount);
      }
    } catch (err) {
      console.error('Mark all notifications read error:', err);
    }
  };

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && typeof data.unreadCount === 'number') {
        dispatchUnreadCountUpdate(data.unreadCount);
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const isHelpDeskNotification = (n) => {
    if (!n) return false;
    const typeLower = (n.type || '').toLowerCase();
    const titleLower = (n.title || '').toLowerCase();
    const msgLower = (n.message || '').toLowerCase();
    const urlLower = (n.actionUrl || '').toLowerCase();

    return (
      typeLower === 'dispute' ||
      typeLower === 'complaint' ||
      urlLower.includes('tab=complaints') ||
      urlLower.includes('tab=disputes') ||
      urlLower.includes('/complaints') ||
      titleLower.includes('help desk') ||
      titleLower.includes('complaint') ||
      titleLower.includes('ticket') ||
      titleLower.includes('dispute') ||
      titleLower.includes('support') ||
      msgLower.includes('help desk') ||
      msgLower.includes('complaint ticket') ||
      msgLower.includes('ticket #') ||
      msgLower.includes('submitted to support')
    );
  };

  const handleNotificationCardClick = (e, n) => {
    if (!n.isRead && !n.read) {
      markRead(n._id);
    }

    if (isHelpDeskNotification(n)) {
      if (typeof onSelectTab === 'function') {
        onSelectTab('complaints');
        return;
      } else {
        localStorage.setItem('parent_activeTab', 'complaints');
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/dashboard/parent#complaints';
        return;
      }
    }

    if (n.actionUrl) {
      if (n.actionUrl.includes('tab=')) {
        const tabParam = n.actionUrl.split('tab=')[1]?.split('&')[0];
        if (tabParam && typeof onSelectTab === 'function') {
          onSelectTab(tabParam);
          return;
        }
      }
      window.location.href = n.actionUrl;
    }
  };

  const handleReadMoreRedirect = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (typeof onSelectTab === 'function') {
      onSelectTab('overview');
    } else {
      localStorage.setItem('parent_activeTab', 'overview');
      window.dispatchEvent(new Event('storage'));
    }
  };

  const parseNotificationPreview = (message = '') => {
    const trimmed = message.trim();
    if (!trimmed) return { previewText: '', hasMore: false };

    const doubleNewlineBlocks = trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    if (doubleNewlineBlocks.length > 1) {
      return {
        previewText: doubleNewlineBlocks[0],
        hasMore: true,
      };
    }

    const singleLines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);
    if (singleLines.length > 1) {
      return {
        previewText: singleLines[0],
        hasMore: true,
      };
    }

    return {
      previewText: trimmed,
      hasMore: false,
    };
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

              const { previewText, hasMore } = parseNotificationPreview(n.message);

              return (
                <div
                  key={n._id}
                  onClick={(e) => handleNotificationCardClick(e, n)}
                  style={{
                    cursor: 'pointer',
                    background: isUnread ? '#faf5ff' : '#ffffff',
                    border: isUnread ? '1px solid #e9d5ff' : '1px solid #e2e8f0',
                    borderLeft: isUnread ? '4px solid #7e22ce' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: '#f3e8ff',
                      color: '#7e22ce',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                      alignSelf: 'center',
                    }}
                  >
                    <i
                      className="fa-solid fa-bell"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        margin: 0,
                        padding: 0,
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                      }}
                    ></i>
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
                        margin: '0 0 8px 0',
                      }}
                    >
                      {previewText}
                    </div>

                    {hasMore && (
                      <div style={{ marginBottom: '10px' }}>
                        <button
                          type="button"
                          onClick={handleReadMoreRedirect}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: '#7e22ce',
                            fontWeight: '700',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          Read More <i className="fa-solid fa-arrow-right" style={{ fontSize: '11px' }}></i>
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {n.actionUrl || isHelpDeskNotification(n) ? (
                        <a
                          href={n.actionUrl || '#'}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleNotificationCardClick(e, n);
                          }}
                          className="dash-btn dash-btn-primary"
                          style={{ background: '#7e22ce', fontSize: '11px', padding: '3px 10px', cursor: 'pointer' }}
                        >
                          {isHelpDeskNotification(n) ? 'View Ticket' : n.type === 'fee' || n.type === 'payment' ? 'Pay Now' : 'View Details'}
                        </a>
                      ) : (
                        <div></div>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => markRead(n._id, e)}
                            style={{ background: 'none', border: 'none', color: '#7e22ce', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            <i className="fa-solid fa-check"></i> Mark Read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => deleteNotification(n._id, e)}
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
