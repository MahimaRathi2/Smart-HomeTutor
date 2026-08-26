import React, { useState, useEffect } from 'react';

export const AdminSidebar = ({
  activeTab,
  onSelectTab,
  adminName,
  adminEmail,
  onOpenAnnouncement,
  onOpenSecurityCenter,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/admin/notifications/unread-count');
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Unread count fetch error:', err);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);

    const handleCustomEvent = (e) => {
      if (e.detail && typeof e.detail.unreadCount === 'number') {
        if (!e.detail.role || e.detail.role === 'admin') {
          setUnreadCount(e.detail.unreadCount);
          return;
        }
      }
      fetchUnreadCount();
    };

    window.addEventListener('unreadCountUpdated', handleCustomEvent);
    window.addEventListener('refreshNotifications', fetchUnreadCount);

    if (window.socket) {
      window.socket.on('receiveNotification', fetchUnreadCount);
      window.socket.on('receiveAdminNotification', fetchUnreadCount);
      window.socket.on('unreadCountChanged', fetchUnreadCount);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('unreadCountUpdated', handleCustomEvent);
      window.removeEventListener('refreshNotifications', fetchUnreadCount);
      if (window.socket) {
        window.socket.off('receiveNotification', fetchUnreadCount);
        window.socket.off('receiveAdminNotification', fetchUnreadCount);
        window.socket.off('unreadCountChanged', fetchUnreadCount);
      }
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSelectTab = (id) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Metrics', icon: 'fa-gauge' },
    { id: 'demo-requests', label: 'Demo Class Requests', icon: 'fa-calendar-check' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell', badge: unreadCount },
    { id: 'users', label: 'User Directory', icon: 'fa-users-gear' },
    { id: 'tutor-verifications', label: 'Tutor Verifications', icon: 'fa-shield-check' },
    { id: 'certificates', label: 'Certificate Approvals', icon: 'fa-award' },
    { id: 'finance', label: 'Finance & Revenue', icon: 'fa-sack-dollar' },
    { id: 'payment-history', label: 'Payment History', icon: 'fa-clock-rotate-left' },
    { id: 'catalog', label: 'Catalog & Boards', icon: 'fa-layer-group' },
    { id: 'disputes', label: 'Disputes & Complaints', icon: 'fa-scale-balanced' },
    { id: 'newsletter', label: 'Newsletter Subscribers', icon: 'fa-envelope-open-text' },
    { id: 'blogs', label: 'Blog Articles', icon: 'fa-newspaper' },
  ];

  return (
    <aside className={`dashboard-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
      {onCloseMobile && (
        <button
          type="button"
          className="mobile-sidebar-close-btn"
          onClick={onCloseMobile}
          aria-label="Close Admin Management Menu"
          title="Close Menu"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
      <div>
        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: '#b45309' }}>
            {getInitials(adminName)}
          </div>
          <div className="user-info">
            <h4 title={adminName || 'System Administrator'}>{adminName || 'System Administrator'}</h4>
            <p title={adminEmail || 'admin@hometutor.com'}>{adminEmail || 'admin@hometutor.com'}</p>
            <span className="role-badge badge-admin">Super Admin</span>
          </div>
        </div>

        <div className="sidebar-menu-title">Admin Management</div>
        <ul className="sidebar-menu">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`dash-tab-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleSelectTab(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <a href={`#${item.id}`} onClick={(e) => e.preventDefault()} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span><i className={`fa-solid ${item.icon}`}></i> {item.label}</span>
                {item.badge > 0 ? (
                  <span style={{ background: '#ef4444', color: '#ffffff', borderRadius: '10px', padding: '1px 8px', fontSize: '11px', fontWeight: '800' }}>
                    {item.badge}
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>

        <div className="sidebar-menu-title" style={{ marginTop: '24px' }}>Security & Broadcasts</div>
        <ul className="sidebar-menu">
          <li>
            <a href="#announcements" onClick={(e) => { e.preventDefault(); onOpenAnnouncement(); if (onCloseMobile) onCloseMobile(); }}>
              <i className="fa-solid fa-bullhorn"></i> Send Announcement
            </a>
          </li>
          <li>
            <a href="#security" onClick={(e) => { e.preventDefault(); onOpenSecurityCenter(); if (onCloseMobile) onCloseMobile(); }}>
              <i className="fa-solid fa-shield-halved"></i> Security Center
            </a>
          </li>
        </ul>
      </div>

      <div className="sidebar-role-switch">
        <a
          href="/logout"
          className="dash-btn dash-btn-outline"
          style={{ width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5', background: '#fee2e2' }}
        >
          <i className="fa-solid fa-right-from-bracket"></i> Sign Out of Admin Panel
        </a>
      </div>
    </aside>
  );
};
