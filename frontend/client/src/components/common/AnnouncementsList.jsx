import React, { useState, useEffect } from 'react';

export const AnnouncementsList = ({ role = 'student' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const deduplicate = (list) => {
    const seen = new Set();
    return list.filter((item) => {
      if (!item) return false;
      const idKey = item._id ? String(item._id) : '';
      const contentKey = `${item.title || ''}:::${item.message || ''}`;
      const uniqueKey = idKey ? `id:${idKey}` : `content:${contentKey}`;

      if (seen.has(uniqueKey) || (idKey && seen.has(`content:${contentKey}`))) {
        return false;
      }
      seen.add(uniqueKey);
      if (idKey) seen.add(`content:${contentKey}`);
      return true;
    });
  };

  const fetchSavedNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setItems(deduplicate(data.notifications));
      }
    } catch (err) {
      console.error('Fetch Announcements Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedNotifications();

    if (typeof window === 'undefined' || !window.io) return;

    const socket = window.socket || window.io();
    window.socket = socket;

    const handleNewAnnouncement = (data) => {
      if (!data || !data.title || !data.message) return;

      const target = (data.targetRole || 'all').toLowerCase();
      const currentRole = (role || '').toLowerCase();

      if (target === 'all' || target === currentRole) {
        const newItem = {
          _id: data._id ? String(data._id) : Date.now().toString(),
          title: data.title,
          message: data.message,
          createdAt: data.createdAt || new Date().toISOString(),
          read: false,
        };

        setItems((prev) => deduplicate([newItem, ...prev]));
      }
    };

    socket.on('receiveAnnouncement', handleNewAnnouncement);

    return () => {
      socket.off('receiveAnnouncement', handleNewAnnouncement);
    };
  }, [role]);

  if (loading) {
    return (
      <div style={{ padding: '14px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Loading announcements...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '16px', fontSize: '13px', color: '#64748b', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <i className="fa-solid fa-bell-slash" style={{ color: '#cbd5e1', marginRight: '6px' }}></i>
        No announcements or notices posted for your panel yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map((item) => {
        const formattedDate = new Date(item.createdAt || Date.now()).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        return (
          <div
            key={item._id}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              fontSize: '13px',
              color: '#1e293b',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <strong style={{ fontSize: '14px', color: '#0f2a4a', fontWeight: '800' }}>
                {item.title}
              </strong>
              <small style={{ fontSize: '11px', color: '#92400e', whiteSpace: 'nowrap', fontWeight: '600', marginLeft: '10px' }}>
                {formattedDate}
              </small>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
              {item.message}
            </p>
          </div>
        );
      })}
    </div>
  );
};
