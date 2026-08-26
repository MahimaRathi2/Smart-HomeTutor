import React, { useState, useEffect } from 'react';
export const NotificationsTab = ({ userRole = 'student', onSelectTab }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        if (typeof data.unreadCount === 'number') {
          dispatchUnreadCountUpdate(data.unreadCount);
        }
      } else {
        setError(data.message || 'Failed to load notifications.');
      }
    } catch (err) {
      console.error('Fetch Notifications Error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dispatchUnreadCountUpdate = (count) => {
    window.dispatchEvent(
      new CustomEvent('unreadCountUpdated', {
        detail: { unreadCount: count, role: userRole },
      })
    );
  };

  const handleMarkAsRead = async (id) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && typeof data.unreadCount === 'number') {
        dispatchUnreadCountUpdate(data.unreadCount);
      }
    } catch (err) {
      console.error('Mark Read Error:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      const res = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && typeof data.unreadCount === 'number') {
        dispatchUnreadCountUpdate(data.unreadCount);
      }
    } catch (err) {
      console.error('Mark All Read Error:', err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && typeof data.unreadCount === 'number') {
        dispatchUnreadCountUpdate(data.unreadCount);
      }
    } catch (err) {
      console.error('Delete Notification Error:', err);
    }
  };

  const isHelpDeskNotification = (item) => {
    if (!item) return false;
    const typeLower = (item.type || '').toLowerCase();
    const titleLower = (item.title || '').toLowerCase();
    const msgLower = (item.message || '').toLowerCase();
    const urlLower = (item.actionUrl || '').toLowerCase();

    return (
      typeLower === 'dispute' ||
      typeLower === 'complaint' ||
      urlLower.includes('tab=complaints') ||
      urlLower.includes('tab=disputes') ||
      urlLower.includes('/complaints') ||
      urlLower.includes('/disputes') ||
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

  const handleNotificationCardClick = (e, item) => {
    // 1. Mark notification as read if unread
    if (!item.isRead && !item.read) {
      handleMarkAsRead(item._id);
    }

    // 2. Help Desk / Complaint notification redirect logic
    if (isHelpDeskNotification(item)) {
      const targetTab = userRole === 'admin' ? 'disputes' : 'complaints';
      if (typeof onSelectTab === 'function') {
        onSelectTab(targetTab);
        return;
      } else {
        const roleKey = `${userRole || 'student'}_activeTab`;
        localStorage.setItem(roleKey, targetTab);
        window.dispatchEvent(new Event('storage'));
        window.location.href = `/dashboard/${userRole || 'student'}#${targetTab}`;
        return;
      }
    }

    // 3. Perform navigation / tab redirection if actionUrl exists
    if (item.actionUrl) {
      if (item.actionUrl.includes('tab=')) {
        const tabParam = item.actionUrl.split('tab=')[1]?.split('&')[0];
        if (tabParam && typeof onSelectTab === 'function') {
          onSelectTab(tabParam);
          return;
        }
      }
      window.location.href = item.actionUrl;
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
      const roleKey = `${userRole || 'student'}_activeTab`;
      localStorage.setItem(roleKey, 'overview');
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'fee':
      case 'payment':
        return { icon: 'fa-credit-card', color: '#0284c7', bg: '#e0f2fe' };
      case 'class':
        return { icon: 'fa-calendar-days', color: '#16a34a', bg: '#dcfce7' };
      case 'assignment':
        return { icon: 'fa-book-open-reader', color: '#9333ea', bg: '#f3e8ff' };
      case 'tutor_request':
        return { icon: 'fa-user-check', color: '#b45309', bg: '#fef3c7' };
      case 'announcement':
        return { icon: 'fa-bullhorn', color: '#dc2626', bg: '#fee2e2' };
      case 'certificate':
        return { icon: 'fa-award', color: '#d97706', bg: '#fef3c7' };
      case 'dispute':
        return { icon: 'fa-scale-balanced', color: '#475569', bg: '#f1f5f9' };
      default:
        return { icon: 'fa-bell', color: '#0f2a4a', bg: '#e2e8f0' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        {/* CARD HEADER */}
        <div
          className="dash-card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-bell" style={{ color: '#0284c7' }}></i>
              Notifications Center
            </h3>
            {unreadCount > 0 && (
              <span
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {unreadCount} New
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                onClick={handleMarkAllAsRead}
                style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '700' }}
              >
                <i className="fa-solid fa-check-double"></i> Mark All as Read
              </button>
            )}
            <button
              type="button"
              className="dash-btn dash-btn-outline"
              onClick={fetchNotifications}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <i className="fa-solid fa-rotate"></i> Refresh
            </button>
          </div>
        </div>

        {/* NOTIFICATION LIST */}
        <div style={{ marginTop: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px', color: '#0284c7', marginBottom: '8px' }}></i>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>Loading notifications...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#dc2626', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fca5a5' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '24px', marginBottom: '6px' }}></i>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
              <i className="fa-regular fa-bell-slash" style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }}></i>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>No Notifications Yet</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>You're all caught up! System alerts and reminders will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map((item) => {
                const isUnread = !item.isRead && !item.read;
                const iconStyle = getNotificationIcon(item.type);
                const formattedDate = new Date(item.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const { previewText, hasMore } = parseNotificationPreview(item.message);

                return (
                  <div
                    key={item._id}
                    onClick={(e) => handleNotificationCardClick(e, item)}
                    style={{
                      cursor: 'pointer',
                      background: isUnread ? '#f0f9ff' : '#ffffff',
                      border: isUnread ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                      borderLeft: isUnread ? '4px solid #0284c7' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px 18px',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                      transition: 'all 0.2s ease',
                      boxShadow: isUnread ? '0 2px 8px rgba(2, 132, 199, 0.08)' : 'none',
                    }}
                  >
                    {/* ICON (Omitted for tutor_request to comply with NO ICON requirement) */}
                    {item.type !== 'tutor_request' && (
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: iconStyle.bg,
                          color: iconStyle.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0,
                          alignSelf: 'center',
                        }}
                      >
                        <i
                          className={`fa-solid ${iconStyle.icon}`}
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
                    )}

                    {/* DETAILS BODY */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: '15px',
                            fontWeight: isUnread ? '800' : '700',
                            color: '#0f2a4a',
                            lineHeight: '1.3',
                          }}
                        >
                          {item.title ? item.title.replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() : ''}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {formattedDate}
                        </span>
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
                              color: '#0284c7',
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

                      {/* ACTION BUTTON & ITEM ACTIONS */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        {item.actionUrl || isHelpDeskNotification(item) ? (
                          <a
                            href={item.actionUrl || '#'}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleNotificationCardClick(e, item);
                            }}
                            className="dash-btn dash-btn-primary"
                            style={{ padding: '4px 12px', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}
                          >
                            {isHelpDeskNotification(item)
                              ? 'View Ticket'
                              : item.type === 'tutor_request'
                              ? 'View Request'
                              : item.type === 'fee' || item.type === 'payment'
                              ? 'Pay Now'
                              : 'View Details'}{' '}
                            <i className="fa-solid fa-arrow-right"></i>
                          </a>
                        ) : <div />}

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(item._id);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#0284c7',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                padding: '4px 8px',
                              }}
                            >
                              <i className="fa-solid fa-check"></i> Mark as Read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item._id, e)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              fontSize: '12px',
                              cursor: 'pointer',
                              padding: '4px 8px',
                            }}
                            title="Dismiss notification"
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
    </div>
  );
};
