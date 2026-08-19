import React from 'react';

export const ParentSidebar = ({
  userName = 'Parent',
  userEmail = 'parent@hometutor.com',
  activeTab = 'overview',
  onSelectTab,
  unreadNotificationsCount = 0,
  onOpenAddChildModal,
  onOpenCertificatesModal,
}) => {
  const avatarInitials = (userName || 'Parent').substring(0, 2).toUpperCase();

  const menuItems = [
    { id: 'overview', label: 'Overview & Attendance', icon: 'fa-house' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell', badge: unreadNotificationsCount },
    { id: 'search-tutors', label: 'Find Tutors for Child', icon: 'fa-magnifying-glass' },
    { id: 'invoices', label: 'Tuition Invoices', icon: 'fa-file-invoice-dollar' },
    { id: 'chat', label: 'Tutor Feedback & Chat', icon: 'fa-comments' },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div>
        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: '#7e22ce' }}>{avatarInitials}</div>
          <div className="user-info">
            <h4 title={userName}>{userName}</h4>
            <p title={userEmail}>{userEmail}</p>
            <span className="role-badge badge-parent">Parent Account</span>
          </div>
        </div>

        <div className="sidebar-menu-title">Parent Portal</div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`dash-tab-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectTab(item.id);
              }}
            >
              <a href="#" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>
                  <i className={`fa-solid ${item.icon}`}></i> {item.label}
                </span>
                {item.badge > 0 && (
                  <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="sidebar-menu-title" style={{ marginTop: '24px' }}>Family Controls</div>
        <ul className="sidebar-menu">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onOpenAddChildModal();
              }}
            >
              <i className="fa-solid fa-user-plus"></i> Add Child Profile
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onOpenCertificatesModal();
              }}
            >
              <i className="fa-solid fa-award"></i> View Child Certificates
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
          <i className="fa-solid fa-right-from-bracket"></i> Sign Out of Parent Panel
        </a>
      </div>
    </aside>
  );
};
