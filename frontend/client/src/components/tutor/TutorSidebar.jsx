import React from 'react';

export const TutorSidebar = ({ activeTab, onSelectTab, tutorName, tutorEmail, unreadCount = 0, unreadNotificationsCount = 0 }) => {
  const getInitials = (name) => {
    if (!name) return 'TU';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Earnings', icon: 'fa-chart-pie' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell', badge: unreadNotificationsCount },
    { id: 'sessions', label: 'Teaching Sessions', icon: 'fa-chalkboard-user' },
    { id: 'requests', label: 'Student Requests', icon: 'fa-envelope-open-text' },
    { id: 'assignments', label: 'Homework & Notes', icon: 'fa-file-arrow-up' },
    { id: 'chat', label: 'Student Chat', icon: 'fa-comments', badge: unreadCount },
    { id: 'rates-availability', label: 'Subjects & Rates', icon: 'fa-sliders' },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div>
        <div className="sidebar-user">
          <div className="user-avatar" style={{ background: '#0f2a4a' }}>
            {getInitials(tutorName)}
          </div>
          <div className="user-info">
            <h4 title={tutorName || 'Tutor Account'}>{tutorName || 'Tutor Account'}</h4>
            <p title={tutorEmail || 'tutor@hometutor.com'}>{tutorEmail || 'tutor@hometutor.com'}</p>
            <span className="role-badge badge-tutor">Verified Educator</span>
          </div>
        </div>

        <div className="sidebar-menu-title">Tutor Workspace</div>
        <ul className="sidebar-menu">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`dash-tab-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <a href={`#${item.id}`} onClick={(e) => e.preventDefault()}>
                <i className={`fa-solid ${item.icon}`}></i> {item.label}
                {item.badge > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    marginLeft: '6px'
                  }}>
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-role-switch">
        <a
          href="/logout"
          className="dash-btn dash-btn-outline"
          style={{ width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5', background: '#fee2e2' }}
        >
          <i className="fa-solid fa-right-from-bracket"></i> Sign Out of Tutor Panel
        </a>
      </div>
    </aside>
  );
};
