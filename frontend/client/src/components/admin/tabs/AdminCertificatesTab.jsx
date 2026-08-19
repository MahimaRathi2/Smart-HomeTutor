import React from 'react';

export const AdminCertificatesTab = ({ requests = [], onApprove, onReject }) => {
  return (
    <div className="dash-tab-content" style={{ display: 'block' }}>
      <div className="dash-card">
        <div className="dash-card-header">
          <h3><i className="fa-solid fa-award"></i> Course Completion Certificate Approval Queue</h3>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          Review tutor completion requests, attendance metrics, and tutor remarks before issuing official verified PDF certificates to students.
        </p>

        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Tutor Name</th>
                <th>Course Name</th>
                <th>Attendance</th>
                <th>Tutor Remarks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No pending certificate approval requests.
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{item.studentName || item.student?.name || 'Student'}</td>
                    <td>{item.tutorName || item.tutor?.name || 'Tutor'}</td>
                    <td>{item.courseName || item.subject || 'Course'}</td>
                    <td><strong style={{ color: '#16a34a' }}>{item.attendancePercentage || '100'}%</strong></td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{item.tutorRemarks || 'Satisfactory completion'}</td>
                    <td>
                      <span className={`status-pill ${item.status === 'Approved' || item.status === 'Issued' ? 'status-approved' : 'status-pending'}`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      {item.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="dash-btn dash-btn-primary"
                            style={{ padding: '4px 10px', fontSize: '12px', background: '#16a34a' }}
                            onClick={() => onApprove(item._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="dash-btn dash-btn-outline"
                            style={{ padding: '4px 10px', fontSize: '12px', color: '#dc2626' }}
                            onClick={() => onReject(item._id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>{item.status}</span>
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
