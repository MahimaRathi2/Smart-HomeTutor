import React from 'react';

export const AdminFinanceTab = ({ finance = {}, payouts = [], onApprovePayout, onRejectPayout, onExportPdf }) => {
  const grossRevenue = finance.grossRevenue || 0;
  const tutorPayoutAmount = finance.tutorPayoutAmount || grossRevenue * 0.85;
  const platformCommissionAmount = finance.platformCommissionAmount || grossRevenue * 0.15;

  const tutorPct = grossRevenue > 0 ? Math.min(100, (tutorPayoutAmount / grossRevenue) * 100) : 85;
  const commPct = grossRevenue > 0 ? Math.min(100, (platformCommissionAmount / grossRevenue) * 100) : 15;

  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-wallet"></i> Platform Revenue & Escrow Commission Log</h3>
          <button className="dash-btn dash-btn-primary" style={{ background: '#b45309' }} onClick={onExportPdf}>
            <i className="fa-solid fa-file-invoice-dollar"></i> Generate Audit PDF
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>
              <span>Tutor Earnings Payout (85%)</span>
              <span style={{ color: '#0f172a' }}>₹{tutorPayoutAmount.toFixed(2)}</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${tutorPct}%`, background: '#0284c7' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>
              <span>Platform Escrow Commission (15%)</span>
              <span style={{ color: '#16a34a' }}>₹{platformCommissionAmount.toFixed(2)}</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${commPct}%`, background: '#16a34a' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* TUTOR PAYOUT APPROVAL REQUESTS */}
      <div className="dash-card" style={{ marginTop: '20px' }}>
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-hand-holding-dollar" style={{ color: '#b45309' }}></i> Pending Educator Payout Requests</h3>
        </div>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Payout ID</th>
                <th>Tutor Name & Email</th>
                <th>Requested Amount</th>
                <th>UPI / Bank Details</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No pending educator payout requests found.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>#{p._id.slice(-6).toUpperCase()}</td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.tutorName || p.user?.name || 'Educator'}</div>
                      <small style={{ color: '#64748b' }}>{p.user?.email || 'N/A'}</small>
                    </td>
                    <td style={{ fontWeight: '800', color: '#0f172a' }}>₹{p.amount?.toFixed(2)}</td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{p.upiId || p.bankAccount || 'UPI Direct'}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{new Date(p.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${p.status === 'Approved' || p.status === 'Completed' ? 'status-approved' : 'status-pending'}`}>
                        {p.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      {p.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="dash-btn dash-btn-primary"
                            style={{ padding: '4px 10px', fontSize: '12px', background: '#16a34a' }}
                            onClick={() => onApprovePayout(p._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="dash-btn dash-btn-outline"
                            style={{ padding: '4px 10px', fontSize: '12px', color: '#dc2626' }}
                            onClick={() => onRejectPayout(p._id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>{p.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
