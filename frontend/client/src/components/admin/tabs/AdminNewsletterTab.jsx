import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../../services/adminApi';

export const AdminNewsletterTab = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ totalSubscribers: 0, activeSubscribers: 0, unsubscribedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNewsletterSubscribers({
        search,
        status: statusFilter,
        role: roleFilter,
        sort: sortOrder,
      });

      if (res.success) {
        setSubscribers(res.subscribers || []);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        showToast('error', res.message || 'Failed to fetch newsletter subscribers.');
      }
    } catch (err) {
      console.error('Fetch newsletter subscribers error:', err);
      showToast('error', 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, roleFilter, sortOrder]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 3500);
  };

  const handleUnsubscribe = async (subscriber) => {
    const confirmed = window.showCustomConfirm
      ? await window.showCustomConfirm(
          `Are you sure you want to unsubscribe ${subscriber.email}?`,
          'Unsubscribe Subscriber',
          'Unsubscribe',
          'Cancel'
        )
      : window.confirm(`Are you sure you want to unsubscribe ${subscriber.email}?`);

    if (!confirmed) return;

    setActionLoading(true);
    try {
      const res = await adminApi.unsubscribeNewsletterSubscriber(subscriber._id);
      if (res.success) {
        showToast('success', res.message || `Unsubscribed ${subscriber.email} successfully.`);
        await fetchSubscribers();
      } else {
        showToast('error', res.message || 'Failed to unsubscribe subscriber.');
      }
    } catch (err) {
      console.error('Unsubscribe error:', err);
      showToast('error', 'Failed to unsubscribe subscriber.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Student':
        return { background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' };
      case 'Tutor':
        return { background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
      case 'Parent':
        return { background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' };
      case 'Admin':
        return { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' };
      default: // Guest
        return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="admin-newsletter-tab" style={{ padding: '4px' }}>
      
      {/* TOAST ALERT */}
      {toast.message && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: '600',
            background: toast.type === 'success' ? '#dcfce7' : '#fef2f2',
            color: toast.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          {toast.message}
        </div>
      )}

      {/* HEADER TITLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f2a4a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-envelope-open-text" style={{ color: '#b45309' }}></i> Newsletter Subscribers
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Manage platform newsletter audience, monitor subscriber roles, and update subscription preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSubscribers}
          className="dash-btn dash-btn-outline"
          style={{ fontSize: '12.5px', padding: '8px 14px' }}
        >
          <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i> Refresh Data
        </button>
      </div>

      {/* STATS CARDS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
              Total Subscribers
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
              <i className="fa-solid fa-users" style={{ fontSize: '16px' }}></i>
            </div>
          </div>
          <h3 style={{ margin: '12px 0 0 0', fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
            {stats.totalSubscribers}
          </h3>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
              Active Subscribers
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '16px' }}></i>
            </div>
          </div>
          <h3 style={{ margin: '12px 0 0 0', fontSize: '26px', fontWeight: '800', color: '#15803d' }}>
            {stats.activeSubscribers}
          </h3>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
              Unsubscribed
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b91c1c' }}>
              <i className="fa-solid fa-user-xmark" style={{ fontSize: '16px' }}></i>
            </div>
          </div>
          <h3 style={{ margin: '12px 0 0 0', fontSize: '26px', fontWeight: '800', color: '#b91c1c' }}>
            {stats.unsubscribedCount}
          </h3>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Box */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}></i>
            <input
              type="text"
              placeholder="Search email or subscriber name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ flex: '0 1 150px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: '#fff' }}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Unsubscribed">Unsubscribed</option>
            </select>
          </div>

          {/* Role Filter */}
          <div style={{ flex: '0 1 150px' }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: '#fff' }}
            >
              <option value="all">All Roles</option>
              <option value="Student">Student</option>
              <option value="Tutor">Tutor</option>
              <option value="Parent">Parent</option>
              <option value="Admin">Admin</option>
              <option value="Guest">Guest</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div style={{ flex: '0 1 150px' }}>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#334155', background: '#fff' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* SUBSCRIBERS TABLE */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        
        <div className="mobile-scroll-container dash-table-wrapper">
          <table className="dash-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>Subscriber Email</th>
                <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>Name / User</th>
                <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>Platform Role</th>
                <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>Subscribed Date</th>
                <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 18px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '20px', color: '#b45309', marginBottom: '8px' }}></i>
                    <p style={{ margin: 0, fontSize: '13px' }}>Loading subscribers...</p>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 18px', textAlign: 'center', color: '#64748b' }}>
                    <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: '28px', color: '#cbd5e1', marginBottom: '8px' }}></i>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>No subscribers found</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                subscribers.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    
                    {/* EMAIL */}
                    <td style={{ padding: '14px 18px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-regular fa-envelope" style={{ color: '#0284c7' }}></i>
                        {item.email}
                      </div>
                    </td>

                    {/* NAME */}
                    <td style={{ padding: '14px 18px', color: '#334155', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </td>

                    {/* ROLE BADGE */}
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          ...getRoleBadgeStyle(item.role),
                        }}
                      >
                        {item.role}
                      </span>
                    </td>

                    {/* DATE */}
                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatDate(item.createdAt)}
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: item.status === 'Active' ? '#dcfce7' : '#fef2f2',
                          color: item.status === 'Active' ? '#15803d' : '#b91c1c',
                          border: `1px solid ${item.status === 'Active' ? '#86efac' : '#fca5a5'}`,
                        }}
                      >
                        <i className={`fa-solid ${item.status === 'Active' ? 'fa-circle' : 'fa-circle-xmark'}`} style={{ fontSize: '8px' }}></i>
                        {item.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {item.status === 'Active' ? (
                        <button
                          type="button"
                          onClick={() => handleUnsubscribe(item)}
                          disabled={actionLoading}
                          className="dash-btn dash-btn-outline"
                          style={{
                            fontSize: '12px',
                            padding: '5px 12px',
                            borderColor: '#fca5a5',
                            color: '#dc2626',
                          }}
                        >
                          <i className="fa-solid fa-user-slash" style={{ marginRight: '4px' }}></i> Unsubscribe
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Unsubscribed on {formatDate(item.unsubscribedAt)}
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER TOTAL COUNT */}
        <div style={{ padding: '12px 18px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '13px', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Total Subscribers Listed: <strong>{subscribers.length}</strong></span>
          <span>Showing real-time MongoDB data</span>
        </div>

      </div>

    </div>
  );
};
