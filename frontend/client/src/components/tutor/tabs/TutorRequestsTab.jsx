import React from 'react';

export const TutorRequestsTab = ({ requests = [], onAccept, onReject }) => {
  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-envelope-open-text"></i> Incoming Student Tuition Inquiries</h3>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          Review demo class booking requests and accept students into your schedule.
        </p>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Subject</th>
                <th>Date Requested</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    No incoming booking requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td style={{ fontWeight: '700', color: '#0f2a4a' }}>
                      {req.student?.name || req.studentName || 'Student'}
                    </td>
                    <td>{req.subject || 'Tuition'} ({req.grade || req.class || 'N/A'})</td>
                    <td>{new Date(req.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${req.status === 'Accepted' ? 'status-confirmed' : req.status === 'Rejected' ? 'status-cancelled' : 'status-pending'}`}>
                        {req.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="dash-btn dash-btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => onAccept(req._id)}
                          >
                            Accept
                          </button>
                          <button
                            className="dash-btn dash-btn-outline"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => onReject(req._id)}
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{req.status}</span>
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
