import React, { useState, useEffect } from 'react';

export const AdminNotificationsTab = ({ onSelectTab }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // 1. Lightweight periodic auto-refresh polling (every 5 seconds)
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    // 2. Socket.IO Real-time notification event listener
    if (window.socket) {
      const handleSocketNotif = () => {
        fetchNotifications(true);
      };
      window.socket.on('receiveNotification', handleSocketNotif);
      window.socket.on('receiveAdminNotification', handleSocketNotif);
      return () => {
        clearInterval(interval);
        window.socket.off('receiveNotification', handleSocketNotif);
        window.socket.off('receiveAdminNotification', handleSocketNotif);
      };
    }

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications/read-all', {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
        setActionSuccessMsg('All notifications marked as read');
        setTimeout(() => setActionSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (id) => {
    const confirmed = window.showCustomConfirm
      ? await window.showCustomConfirm('Are you sure you want to delete this notification?', 'Delete Notification', 'Delete', 'Cancel')
      : window.confirm('Are you sure you want to delete this notification?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleActionClick = (e, url) => {
    e.preventDefault();
    if (!url) return;
    if (url.includes('tab=')) {
      const tabParam = url.split('tab=')[1]?.split('&')[0];
      if (tabParam && onSelectTab) {
        onSelectTab(tabParam);
        return;
      }
    }
    window.location.href = url;
  };

  // Filter & Search Logic
  const filteredNotifications = notifications
    .filter((item) => {
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const sourceName = item.sourceUser?.name || '';
        const sourceEmail = item.sourceUser?.email || '';
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesMessage = item.message?.toLowerCase().includes(query);
        const matchesUser =
          sourceName.toLowerCase().includes(query) || sourceEmail.toLowerCase().includes(query);

        if (!matchesTitle && !matchesMessage && !matchesUser) return false;
      }

      // Role Filter
      if (roleFilter !== 'all') {
        const sourceRole = (item.sourceRole || item.sourceUser?.role || '').toLowerCase();
        if (sourceRole !== roleFilter.toLowerCase()) return false;
      }

      // Type Filter
      if (typeFilter !== 'all') {
        if (item.type !== typeFilter) return false;
      }

      // Status Filter
      if (statusFilter === 'unread') {
        if (item.isRead || item.read) return false;
      } else if (statusFilter === 'read') {
        if (!item.isRead && !item.read) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      {/* HEADER BAR */}
      <div
        className="dash-card"
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Notifications
            <span
              style={{
                fontSize: '12px',
                background: unreadCount > 0 ? '#ef4444' : '#64748b',
                color: '#ffffff',
                padding: '2px 10px',
                borderRadius: '12px',
                fontWeight: 700,
              }}
            >
              {unreadCount} Unread
            </span>
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            System-wide notification center for Student, Tutor, and Parent activities.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="dash-btn dash-btn-outline"
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Mark All as Read
          </button>
        )}
      </div>

      {actionSuccessMsg && (
        <div className="dash-card" style={{ background: '#dcfce7', borderColor: '#86efac', color: '#166534', padding: '12px 16px', marginBottom: '20px', fontSize: '13px' }}>
          {actionSuccessMsg}
        </div>
      )}

      {/* FILTERS & SEARCH TOOLBAR */}
      <div
        className="dash-card"
        style={{
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
            Search
          </label>
          <input
            type="text"
            className="tr-input"
            placeholder="Search keyword or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', fontSize: '13px' }}
          />
        </div>

        {/* Filter by Role */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
            User Role
          </label>
          <select
            className="tr-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '100%', fontSize: '13px' }}
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        {/* Filter by Type */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
            Activity Type
          </label>
          <select
            className="tr-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '100%', fontSize: '13px' }}
          >
            <option value="all">All Types</option>
            <option value="tutor_request">Tutor Request</option>
            <option value="verification">Tutor Verification</option>
            <option value="dispute">Complaint / Dispute</option>
            <option value="enquiry">Contact Enquiry</option>
            <option value="payment">Payment / Fee</option>
            <option value="system">System Notification</option>
          </select>
        </div>

        {/* Filter by Status */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
            Status
          </label>
          <select
            className="tr-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', fontSize: '13px' }}
          >
            <option value="all">All Statuses</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
            Sort Order
          </label>
          <select
            className="tr-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ width: '100%', fontSize: '13px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* NOTIFICATION FEED LIST */}
      {loading ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading notifications...
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#334155' }}>No Notifications Found</h3>
          <p style={{ margin: 0, fontSize: '13px' }}>
            There are no notifications matching your current search or filter criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifications.map((item) => {
            const isUnread = !item.isRead && !item.read;
            const sourceUserObj = item.sourceUser || {};
            const sourceUserName = sourceUserObj.name || sourceUserObj.email || '';
            const rawRole = item.sourceRole || sourceUserObj.role || '';
            const formattedRole = rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1) : '';
            const formattedDate = new Date(item.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            // Action Button Text Logic
            let actionText = 'View Details';
            if (item.type === 'tutor_request') actionText = 'View Request';
            else if (item.type === 'verification') actionText = 'View Application';
            else if (item.type === 'dispute') actionText = 'View Complaint';
            else if (item.type === 'enquiry') actionText = 'View Enquiry';
            else if (item.type === 'payment') actionText = 'View Payout';

            return (
              <div
                key={item._id}
                className="dash-card"
                style={{
                  background: isUnread ? '#f8fafc' : '#ffffff',
                  borderLeft: isUnread ? '4px solid #0284c7' : '1px solid #e2e8f0',
                  padding: '16px 20px',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* TOP ROW: Title & Source User Tag + Timestamp */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: isUnread ? '800' : '700',
                        color: '#0f2a4a',
                        lineHeight: '1.3',
                      }}
                    >
                      {item.title}
                    </h4>

                    {/* Source User Badge */}
                    {sourceUserName && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#0284c7',
                          background: '#e0f2fe',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {sourceUserName} {formattedRole ? `(${formattedRole})` : ''}
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {formattedDate}
                  </span>
                </div>

                {/* BODY MESSAGE */}
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                  {item.message}
                </p>

                {/* BOTTOM ROW: Action Button & Item Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    {item.actionUrl ? (
                      <a
                        href={item.actionUrl}
                        onClick={(e) => handleActionClick(e, item.actionUrl)}
                        className="dash-btn dash-btn-primary"
                        style={{ padding: '4px 12px', fontSize: '12px', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        {actionText}
                      </a>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(item._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Mark as Read
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteNotification(item._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
