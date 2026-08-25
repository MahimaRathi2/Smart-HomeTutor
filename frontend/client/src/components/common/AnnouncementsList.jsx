import React, { useState, useEffect } from 'react';

export const AnnouncementsList = ({ role = 'student' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements', { credentials: 'include' });
      const data = await res.json();
      if (data.success && Array.isArray(data.announcements)) {
        setItems(deduplicate(data.announcements));
      }
    } catch (err) {
      console.error('Fetch Announcements Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedAnnouncement) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedAnnouncement]);

  const parseAnnouncementPreview = (message = '') => {
    const trimmed = message.trim();
    if (!trimmed) return { previewText: '', hasMore: false };

    // Split by double newlines or single paragraph breaks
    const doubleNewlineBlocks = trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    if (doubleNewlineBlocks.length > 1) {
      return {
        previewText: doubleNewlineBlocks[0],
        hasMore: true,
      };
    }

    // Split by single linebreaks if no double newlines exist
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
    <div
      className="announcements-list-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '480px',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '6px',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
      }}
    >
      {items.map((item) => {
        const formattedDate = new Date(item.createdAt || Date.now()).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        const { previewText, hasMore } = parseAnnouncementPreview(item.message);

        return (
          <div
            key={item._id}
            className="announcement-item-card"
            style={{
              padding: '16px 18px',
              borderRadius: '12px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              fontSize: '13px',
              color: '#1e293b',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              overflow: 'visible',
            }}
          >
            <div
              className="announcement-item-header"
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px',
                gap: '12px',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
              }}
            >
              <strong
                className="announcement-item-title"
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: '14.5px',
                  color: '#0f2a4a',
                  fontWeight: '800',
                  lineHeight: '1.35',
                  overflowWrap: 'anywhere',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                {item.title}
              </strong>
              <small
                className="announcement-item-date"
                style={{
                  fontSize: '11px',
                  color: '#92400e',
                  whiteSpace: 'nowrap',
                  fontWeight: '700',
                  flexShrink: 0,
                  marginLeft: '10px',
                }}
              >
                {formattedDate}
              </small>
            </div>

            <div
              className="announcement-content-body"
              style={{
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                height: 'auto',
                maxHeight: 'none',
                overflow: 'visible',
                overflowWrap: 'anywhere',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                textOverflow: 'clip',
                fontSize: '13.5px',
                color: '#334155',
                lineHeight: '1.6',
                margin: 0,
                boxSizing: 'border-box',
              }}
            >
              {previewText}
            </div>

            {hasMore && (
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#0284c7',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0369a1')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#0284c7')}
                >
                  Read More <i className="fa-solid fa-arrow-right" style={{ fontSize: '11px' }}></i>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* FULL ANNOUNCEMENT POPUP MODAL (PERFECTLY CENTERED IN VIEWPORT) */}
      {selectedAnnouncement && (
        <div
          className="announcement-modal-overlay"
          onClick={() => setSelectedAnnouncement(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999999,
            margin: 0,
            padding: 0,
          }}
        >
          <div
            className="announcement-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '680px',
              maxHeight: '85vh',
              background: '#ffffff',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #fde68a',
              overflow: 'hidden',
              zIndex: 1000000,
              margin: 0,
              boxSizing: 'border-box',
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: '20px 24px',
                background: '#fffbeb',
                borderBottom: '1px solid #fde68a',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                flexShrink: 0,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: '800',
                    color: '#0f2a4a',
                    lineHeight: '1.4',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                  }}
                >
                  {selectedAnnouncement.title}
                </h3>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#92400e',
                    fontWeight: '700',
                    marginTop: '6px',
                    display: 'inline-block',
                  }}
                >
                  <i className="fa-solid fa-clock" style={{ marginRight: '5px' }}></i>
                  {new Date(selectedAnnouncement.createdAt || Date.now()).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0 4px',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
                title="Close Announcement"
              >
                &times;
              </button>
            </div>

            {/* MODAL BODY (SCROLLABLE FULL CONTENT) */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                overflowX: 'hidden',
                flex: 1,
                maxHeight: 'calc(85vh - 130px)',
                fontSize: '14.5px',
                color: '#334155',
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              {selectedAnnouncement.message}
            </div>

            {/* MODAL FOOTER */}
            <div
              style={{
                padding: '14px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justify: 'flex-end',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="dash-btn dash-btn-outline"
                style={{
                  padding: '6px 18px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  fontWeight: '700',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
