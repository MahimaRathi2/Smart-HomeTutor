import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/adminApi';

export const AdminPaymentHistoryTab = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPaymentHistory(currentPage, search, statusFilter);
  }, [currentPage, statusFilter]);

  const fetchPaymentHistory = async (page = 1, searchQuery = search, status = statusFilter) => {
    setLoading(true);
    try {
      const apiParams = {
        page,
        limit: 15,
      };
      if (searchQuery && searchQuery.trim()) {
        apiParams.search = searchQuery.trim();
      }
      if (status && status.toLowerCase() !== 'all') {
        apiParams.status = status;
      }

      const res = await adminApi.getPaymentHistory(apiParams);

      if (res.success && Array.isArray(res.payments)) {
        setPayments(res.payments);
        setTotalPayments(res.totalPayments || res.payments.length);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || page);
      }
    } catch (err) {
      console.error('Fetch Admin Payment History Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPaymentHistory(1, search, statusFilter);
  };

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toUpperCase();
    if (s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETED') {
      return (
        <span
          className="status-pill status-confirmed"
          style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: '800' }}
        >
          <i className="fa-solid fa-circle-check" style={{ marginRight: '4px' }}></i> SUCCESS
        </span>
      );
    }
    if (s === 'FAILED') {
      return (
        <span
          className="status-pill status-cancelled"
          style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontWeight: '800' }}
        >
          <i className="fa-solid fa-circle-xmark" style={{ marginRight: '4px' }}></i> FAILED
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span
          className="status-pill"
          style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: '800' }}
        >
          <i className="fa-solid fa-ban" style={{ marginRight: '4px' }}></i> CANCELLED
        </span>
      );
    }
    return (
      <span
        className="status-pill status-pending"
        style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: '800' }}
      >
        <i className="fa-solid fa-clock" style={{ marginRight: '4px' }}></i> PENDING
      </span>
    );
  };

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      {/* HEADER & REFRESH */}
      <div className="dash-card" style={{ marginBottom: '20px' }}>
        <div className="dash-card-header" style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color: '#b45309' }}></i> Platform Payment History & Audit Log
          </h3>
          <button
            className="dash-btn dash-btn-outline"
            onClick={() => fetchPaymentHistory(currentPage, search, statusFilter)}
            style={{ fontSize: '12.5px', padding: '6px 14px' }}
          >
            <i className="fa-solid fa-arrows-rotate"></i> Refresh History
          </button>
        </div>

        {/* SEARCH & FILTERS BAR WITH PERFECT SPACING & FULL VISIBILITY */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="tr-input"
              placeholder="Search Student, Tutor, Order ID, Payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                fontSize: '13.5px',
                padding: '0 14px',
                borderRadius: '8px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ width: '240px', flexShrink: 0 }}>
            <select
              className="tr-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                height: '42px',
                fontSize: '13px',
                fontWeight: '600',
                padding: '0 28px 0 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                boxSizing: 'border-box',
                lineHeight: '40px',
                display: 'block',
              }}
            >
              <option value="all">All Statuses (Success & Failures)</option>
              <option value="Success">Success / Paid</option>
              <option value="Failed">Failed Attempts</option>
              <option value="Cancelled">Cancelled Checkouts</option>
              <option value="Pending">Pending Orders</option>
            </select>
          </div>

          <button
            type="submit"
            className="dash-btn dash-btn-accent"
            style={{ height: '42px', padding: '0 20px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="fa-solid fa-magnifying-glass"></i> Filter
          </button>
        </form>
      </div>

      {/* PAYMENT HISTORY TABLE */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>
            Showing {payments.length} of {totalPayments} Transaction Attempt Records
          </h4>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Order / Ref ID</th>
                <th>Razorpay Payment ID</th>
                <th>Student</th>
                <th>Tutor / Service</th>
                <th>Amount</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Details / Reason</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '20px', color: '#b45309', marginRight: '8px' }}></i>
                    Loading verified payment history from database...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No payment attempts found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '12px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        #{p.orderId ? p.orderId.substring(0, 14) : p._id.substring(0, 8)}
                        {(p.isTestMode || (p.orderId && p.orderId.includes('_sim_')) || (p.paymentId && p.paymentId.includes('sim_'))) && (
                          <span
                            title="Test Mode Transaction (Excluded from Gross Revenue & Payouts)"
                            style={{
                              fontSize: '9.5px',
                              background: '#f3e8ff',
                              color: '#7e22ce',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: '800',
                              border: '1px solid #d8b4fe',
                              textTransform: 'uppercase',
                              lineHeight: '1.2',
                            }}
                          >
                            TEST MODE
                          </span>
                        )}
                      </div>
                      <small style={{ fontSize: '11px', color: '#64748b' }}>{p.paymentType || 'Tuition Fee Payment'}</small>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: p.paymentId ? '#0f2a4a' : '#94a3b8' }}>
                        {p.paymentId || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                        {p.user ? p.user.name : 'Student User'}
                      </div>
                      <small style={{ color: '#64748b' }}>{p.user ? p.user.email : 'N/A'}</small>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#0f2a4a' }}>
                        {p.tutor ? p.tutor.name : 'HomeTutor Platform'}
                      </div>
                      <small style={{ color: '#64748b' }}>{p.booking ? p.booking.subject || 'Tuition Fee' : 'Platform Escrow'}</small>
                    </td>

                    <td style={{ fontWeight: '800', fontSize: '14px', color: '#0f2a4a' }}>
                      ₹{p.amount ? p.amount.toLocaleString('en-IN') : '0'}
                    </td>

                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      {new Date(p.createdAt || Date.now()).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>

                    <td>{getStatusBadge(p.paymentStatus)}</td>

                    <td style={{ fontSize: '12px', color: p.failureReason ? '#dc2626' : '#64748b', maxWidth: '200px' }}>
                      {p.failureReason ? p.failureReason : p.paymentStatus === 'Success' || p.paymentStatus === 'Paid' ? 'Verified Escrow' : 'Order Created'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 8px' }}>
            <button
              className="dash-btn dash-btn-outline"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              <i className="fa-solid fa-chevron-left"></i> Previous Page
            </button>

            <span style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="dash-btn dash-btn-outline"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              Next Page <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
